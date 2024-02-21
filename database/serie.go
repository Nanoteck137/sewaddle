package database

import (
	"context"

	"github.com/doug-martin/goqu/v9"
)

type Serie struct {
	Id           string
	Name         string
	Cover        string
	ChapterCount int `db:"count"`
}

func (db *Database) GetAllSeries(ctx context.Context) ([]Serie, error) {
	chapterCount := dialect.
		From("chapters").
		Select(goqu.C("serieId"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serieId").
		As("chapterCount")

	ds := dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")}))

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Serie
	for rows.Next() {
		var item Serie
		rows.Scan(&item.Id, &item.Name, &item.Cover, &item.ChapterCount)
		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetSerieById(ctx context.Context, id string) (Serie, error) {
	chapterCount := dialect.
		From("chapters").
		Select(goqu.C("serieId"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serieId").
		As("chapterCount")

	ds := dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")})).
		Where(goqu.C("id").Eq(id))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Id, &item.Name, &item.Cover, &item.ChapterCount)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}
