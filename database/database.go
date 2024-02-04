package database

import (
	"context"

	"github.com/doug-martin/goqu/v9"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Database struct {
	conn *pgxpool.Pool
}

var Dialect = goqu.Dialect("postgres")

func New(conn *pgxpool.Pool) *Database {
	return &Database{
		conn: conn,
	}
}

type Serie struct {
	Id           string
	Name         string
	Cover        string
	ChapterCount int `db:"count"`
}

func (db *Database) GetAllSeries(ctx context.Context) ([]Serie, error) {
	chapterCount := Dialect.
		From("chapters").
		Select(goqu.C("serieId"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serieId").
		As("chapterCount")

	sql, _, err := Dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")})).
		ToSQL()
	if err != nil {
		return nil, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return nil, err
	}

	var items []Serie
	err = pgxscan.ScanAll(&items, rows)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (db *Database) GetSerieById(ctx context.Context, id string) (Serie, error) {
	chapterCount := Dialect.
		From("chapters").
		Select(goqu.C("serieId"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serieId").
		As("chapterCount")

	sql, _, err := Dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")})).
		Where(goqu.C("id").Eq(id)).
		Limit(1).
		ToSQL()
	if err != nil {
		return Serie{}, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}

type Chapter struct {
	Id      string
	Index   int `db:"idx"`
	Title   string
	SerieId string `db:"serieId"`
}

func (db *Database) GetAllChapters(ctx context.Context) ([]Chapter, error) {
	sql, _, err := Dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId").
		ToSQL()
	if err != nil {
		return nil, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	err = pgxscan.ScanAll(&items, rows)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (db *Database) GetChapterById(ctx context.Context, id string) (Chapter, error) {
	sql, _, err := Dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId").
		Where(goqu.C("id").Eq(id)).
		Limit(1).
		ToSQL()
	if err != nil {
		return Chapter{}, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}
