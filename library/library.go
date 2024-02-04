package library

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nanoteck137/sewaddle/types"
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

type Chapter struct {
	Path  string
	Title string
	Index int
}

type Serie struct {
	Path      string
	Title     string
	CoverPath string
	Chapters  []Chapter
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

		coverPath := path.Join(entry.Name(), "images", metadata.Cover)
		fmt.Printf("coverPath: %v\n", coverPath)

		var chapters []Chapter

		for _, chapter := range metadata.Chapters {
			chapters = append(chapters, Chapter{
				Path:  path.Join(p, strconv.Itoa(chapter.Index)),
				Title: chapter.Name,
				Index: chapter.Index,
			})
		}

		// pretty.Println(metadata)
		series = append(series, Serie{
			Path:      p,
			Title:     metadata.Title,
			CoverPath: coverPath,
			Chapters:  chapters,
		})
	}

	// pretty.Println(series)

	return &Library{
		Base:   dir,
		Series: series,
	}, nil
}

var dialect = goqu.Dialect("postgres")

func GetByPath[T any](db *pgxpool.Pool, table, path string) (*T, error) {
	sql, params, err := dialect.From(table).Select().Where(goqu.C("path").Eq(path)).Limit(1).Prepared(true).ToSQL()
	if err != nil {
		return nil, err
	}

	rows, err := db.Query(context.Background(), sql, params...)
	if err != nil {
		return nil, err
	}

	var res T
	err = pgxscan.ScanOne(&res, rows)
	if err != nil {
		return nil, err
	}

	return &res, nil
}

func Create[T any](db *pgxpool.Pool, tableName string, record goqu.Record) (*T, error) {
	sql, params, err := dialect.Insert(tableName).Rows(record).Returning(goqu.C("*")).Prepared(true).ToSQL()
	if err != nil {
		return nil, err
	}

	// fmt.Printf("sql: %v\n", sql)
	// fmt.Printf("params: %v\n", params)

	rows, err := db.Query(context.Background(), sql, params...)
	if err != nil {
		return nil, err
	}

	var res T
	err = pgxscan.ScanOne(&res, rows)
	if err != nil {
		return nil, err
	}

	return &res, nil
}

type DbSerie struct {
	Id    string
	Name  string
	Cover string
	Path  string
}

func GetSerieByPath(db *pgxpool.Pool, path string) (*DbSerie, error) {
	return GetByPath[DbSerie](db, "series", path)
}

func CreateSerie(db *pgxpool.Pool, name, path string) (*DbSerie, error) {
	return Create[DbSerie](db, "series", goqu.Record{
		"id":    utils.CreateId(),
		"name":  name,
		"cover": "",
		"path":  path,
	})
}

func UpdateSerieCover(db *pgxpool.Pool, id, coverPath string) error {
	sql, params, err := dialect.Update("series").
		Set(goqu.Record{"cover": coverPath}).
		Where(goqu.C("id").Eq(id)).
		Prepared(true).
		ToSQL()
	if err != nil {
		return err
	}

	// fmt.Printf("sql: %v\n", sql)
	// fmt.Printf("params: %v\n", params)

	tag, err := db.Exec(context.Background(), sql, params...)
	if err != nil {
		return err
	}

	fmt.Printf("tag: %v\n", tag)

	return nil

}

func GetOrCreateSerie(db *pgxpool.Pool, serie *Serie) (*DbSerie, error) {
	dbSerie, err := GetSerieByPath(db, serie.Path)
	if err != nil {
		if pgxscan.NotFound(err) {
			dbSerie, err := CreateSerie(db, serie.Title, serie.Path)
			if err != nil {
				return nil, err
			}

			return dbSerie, nil
		} else {
			return nil, err
		}
	}

	return dbSerie, nil
}

type DbChapter struct {
	Id      string
	Idx     int
	Title   string
	SerieId string `db:"serieId"`
	Path    string
}

func GetChapterByPath(db *pgxpool.Pool, path string) (*DbChapter, error) {
	return GetByPath[DbChapter](db, "chapters", path)
}

func CreateChapter(db *pgxpool.Pool, index int, title, serieId string, path string) (*DbChapter, error) {
	return Create[DbChapter](db, "chapters", goqu.Record{
		"id":      utils.CreateId(),
		"idx":     index,
		"title":   title,
		"serieId": serieId,
		"path":    path,
	})
}

func GetOrCreateChapter(db *pgxpool.Pool, chapter *Chapter, serie *DbSerie) (*DbChapter, error) {
	dbChapter, err := GetChapterByPath(db, chapter.Path)
	if err != nil {
		if pgxscan.NotFound(err) {
			dbChapter, err := CreateChapter(db, chapter.Index, chapter.Title, serie.Id, chapter.Path)
			if err != nil {
				return nil, err
			}

			return dbChapter, nil
		} else {
			return nil, err
		}
	}

	return dbChapter, nil
}

func (lib *Library) Sync(db *pgxpool.Pool, workDir types.WorkDir) {
	imagesDir := workDir.ImagesDir()
	err := os.MkdirAll(imagesDir, 0755)
	if err != nil {
		// TODO(patrik): Remove
		log.Fatal(err)
	}

	for _, serie := range lib.Series {
		dbSerie, err := GetOrCreateSerie(db, &serie)
		if err != nil {
			log.Println("Err:", err)
			continue
		}

		ext := path.Ext(serie.CoverPath)
		name := dbSerie.Id + ext
		dst := path.Join(imagesDir, name)

		src, err := filepath.Abs(path.Join(lib.Base, serie.CoverPath))
		if err != nil {
			// TODO(patrik): Remove
			log.Fatal(err)
		}

		err = os.Symlink(src, dst)
		if err != nil {
			if os.IsExist(err) {
				err := os.Remove(dst)
				if err != nil {
					// TODO(patrik): Remove
					log.Fatal(err)
				}

				err = os.Symlink(src, dst)
				if err != nil {
					// TODO(patrik): Remove
					log.Fatal(err)
				}
			} else {
				// TODO(patrik): Remove
				log.Fatal(err)
			}
		}

		err = UpdateSerieCover(db, dbSerie.Id, name)
		if err != nil {
			log.Fatal(err)
		}

		for _, chapter := range serie.Chapters {
			dbChapter, err := GetOrCreateChapter(db, &chapter, dbSerie)
			if err != nil {
				log.Println("Err:", err)
			}

			_ = dbChapter
		}

		_ = dbSerie
	}
}
