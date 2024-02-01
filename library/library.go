package library

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kr/pretty"
	"github.com/nanoteck137/sewaddle/utils"
)

type ChapterMetadata struct {
	Index int      `json:"index"`
	Name  string   `json:"name"`
	Pages []string `json:"pages"`
}

type SerieMetadata struct {
	Title    string            `json:"title"`
	Cover    string            `json:"cover"`
	Chapters []ChapterMetadata `json:"chapters"`
}

type Serie struct {
	Path     string
	Metadata SerieMetadata
}

type Library struct {
	Base   string
	Series []Serie
}

func ReadFromDir(dir string) (*Library, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var series []Serie

	for _, entry := range entries {
		// Skip over files and folders starting with a dot
		if entry.Name()[0] == '.' {
			continue
		}

		p := path.Join(dir, entry.Name())

		data, err := os.ReadFile(path.Join(p, "manga.json"))
		if err != nil {
			log.Printf("Warning: '%v' has no manga.json", p)
			return nil, err
		}

		var metadata SerieMetadata
		err = json.Unmarshal(data, &metadata)
		if err != nil {
			return nil, err
		}

		pretty.Println(metadata)
		series = append(series, Serie{
			Path:     p,
			Metadata: metadata,
		})
	}

	pretty.Println(series)

	return &Library{
		Base:   dir,
		Series: series,
	}, nil
}

var dialect = goqu.Dialect("postgres")

type DbSerie struct {
	Id   string
	Name string
	Path string
}

func GetSerieByPath(db *pgxpool.Pool, path string) (DbSerie, error) {
	sql, params, err := dialect.From("series").Select().Where(goqu.C("path").Eq(path)).Limit(1).Prepared(true).ToSQL()
	if err != nil {
		return DbSerie{}, err
	}

	rows, err := db.Query(context.Background(), sql, params...)
	if err != nil {
		return DbSerie{}, err
	}

	var res DbSerie
	err = pgxscan.ScanOne(&res, rows)
	if err != nil {
		return DbSerie{}, err
	}

	return res, nil
}

func CreateSerie(db *pgxpool.Pool, name, path string) (DbSerie, error) {
	sql, params, err := dialect.Insert("series").Rows(goqu.Record{
		"id":   utils.CreateId(),
		"name": name,
		"path": path,
	}).Returning(goqu.C("*")).Prepared(true).ToSQL()
	if err != nil {
		return DbSerie{}, err
	}

	fmt.Printf("sql: %v\n", sql)
	fmt.Printf("params: %v\n", params)

	rows, err := db.Query(context.Background(), sql, params...)
	if err != nil {
		return DbSerie{}, err
	}

	var res DbSerie
	err = pgxscan.ScanOne(&res, rows)
	if err != nil {
		return DbSerie{}, err
	}

	return res, nil
}

func GetOrCreateSerie(db *pgxpool.Pool, serie *Serie) (DbSerie, error) {
	dbSerie, err := GetSerieByPath(db, serie.Path)
	if err != nil {
		if pgxscan.NotFound(err) {
			dbSerie, err := CreateSerie(db, serie.Metadata.Title, serie.Path)
			if err != nil {
				return DbSerie{}, err
			}

			return dbSerie, nil
		} else {
			return DbSerie{}, err
		}
	}

	return dbSerie, nil
}

func (lib *Library) Sync(db *pgxpool.Pool) {
	for _, serie := range lib.Series {
		dbSerie, err := GetOrCreateSerie(db, &serie)
		if err != nil {
			log.Println("Err:", err)
			continue
		}

		_ = dbSerie
	}
}
