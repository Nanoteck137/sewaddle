package database

import (
	"context"

	"github.com/doug-martin/goqu/v9"
	"github.com/nanoteck137/sewaddle/utils"
)

type Serie struct {
	Id           string
	Name         string
	Cover        string
	Path         string
	ChapterCount int `db:"count"`
}

func (db *Database) GetAllSeries(ctx context.Context) ([]Serie, error) {
	chapterCount := dialect.
		From("chapters").
		Select(goqu.C("serie_id"), goqu.COUNT(goqu.C("number")).As("count")).
		GroupBy("chapters.serie_id").
		As("chapter_count")

	ds := dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapter_count.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serie_id").Table("chapter_count")}))

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
		Select(goqu.C("serie_id"), goqu.COUNT(goqu.C("number")).As("count")).
		GroupBy("chapters.serie_id").
		As("chapter_count")

	ds := dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapter_count.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serie_id").Table("chapter_count")})).
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

func (db *Database) GetSerieByPath(ctx context.Context, path string) (Serie, error) {
	ds := dialect.
		From("series").
		Select("id", "name", "cover", "path").
		Where(goqu.C("path").Eq(path))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Id, &item.Name, &item.Cover, &item.Path)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}

func (db *Database) CreateSerie(ctx context.Context, name, path string) (Serie, error) {
	ds := dialect.Insert("series").
		Rows(goqu.Record{
			"id": utils.CreateId(),
			"name": name,
			"cover": "",
			"path": path,
		}).
		Returning("id", "name", "cover", "path").
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Id, &item.Name, &item.Cover, &item.Path)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}

func (db *Database) UpdateSerieCover(ctx context.Context, id, coverPath string) error {
	ds := dialect.Update("series").
		Set(goqu.Record{"cover": coverPath}).
		Where(goqu.C("id").Eq(id)).
		Prepared(true)

	_, err := db.Exec(context.Background(), ds)
	if err != nil {
		return err
	}

	return nil

}
