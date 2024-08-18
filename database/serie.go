package database

import (
	"context"
	"database/sql"
	"errors"

	"github.com/doug-martin/goqu/v9"
	"github.com/nanoteck137/sewaddle/types"
)

type Serie struct {
	Slug         string
	Name         string
	Cover        string
	Path         string
	ChapterCount int
}

func (db *Database) GetAllSeries(ctx context.Context) ([]Serie, error) {
	chapterCount := dialect.
		From("chapters").
		Select(goqu.C("serie_slug"), goqu.COUNT(goqu.C("slug")).As("count")).
		GroupBy("chapters.serie_slug").
		As("chapter_count")

	ds := dialect.
		From("series").
		Select("series.slug", "series.name", "series.cover", "chapter_count.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.slug": goqu.C("serie_slug").Table("chapter_count")})).
		Order(goqu.I("series.name").Asc())

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Serie
	for rows.Next() {
		var item Serie
		rows.Scan(&item.Slug, &item.Name, &item.Cover, &item.ChapterCount)
		items = append(items, item)
	}

	return items, nil
}

// TODO(patrik): Rename to GetSerieBySlug
func (db *Database) GetSerieById(ctx context.Context, slug string) (Serie, error) {
	chapterCount := dialect.
		From("chapters").
		Select(goqu.C("serie_slug"), goqu.COUNT(goqu.C("slug")).As("count")).
		GroupBy(goqu.I("chapters.serie_slug")).
		As("chapter_count")

	ds := dialect.
		From("series").
		Select("series.slug", "series.name", "series.cover", "chapter_count.count").
		Join(chapterCount,
			goqu.On(
				goqu.Ex{"series.slug": goqu.C("serie_slug").Table("chapter_count")},
			),
		).
		Where(goqu.C("slug").Eq(slug))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Slug, &item.Name, &item.Cover, &item.ChapterCount)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Serie{}, types.ErrNoSerie
		}

		return Serie{}, err
	}

	return item, nil
}

func (db *Database) GetSerieByName(ctx context.Context, name string) (Serie, error) {
	chapterCount := dialect.
		From("chapters").
		Select(goqu.C("serie_slug"), goqu.COUNT(goqu.C("number")).As("count")).
		GroupBy("chapters.serie_slug").
		As("chapter_count")

	ds := dialect.
		From("series").
		Select("series.slug", "series.name", "series.cover", "chapter_count.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.slug": goqu.C("serie_slug").Table("chapter_count")})).
		Where(goqu.I("series.name").Eq(name))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Slug, &item.Name, &item.Cover, &item.ChapterCount)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Serie{}, types.ErrNoSerie
		}

		return Serie{}, err
	}

	return item, nil
}

func (db *Database) GetSerieByPath(ctx context.Context, path string) (Serie, error) {
	ds := dialect.
		From("series").
		Select("slug", "name", "cover", "path").
		Where(goqu.C("path").Eq(path))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Slug, &item.Name, &item.Cover, &item.Path)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Serie{}, types.ErrNoSerie
		}

		return Serie{}, err
	}

	return item, nil
}

func (db *Database) CreateSerie(ctx context.Context, slug, name, path string) (Serie, error) {
	ds := dialect.Insert("series").
		Rows(goqu.Record{
			"slug":  slug,
			"name":  name,
			"cover": "",
			"path":  path,
		}).
		Returning("slug", "name", "cover", "path").
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Slug, &item.Name, &item.Cover, &item.Path)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}

func (db *Database) UpdateSerieCover(ctx context.Context, slug, coverPath string) error {
	ds := dialect.Update("series").
		Set(goqu.Record{"cover": coverPath}).
		Where(goqu.C("slug").Eq(slug)).
		Prepared(true)

	_, err := db.Exec(context.Background(), ds)
	if err != nil {
		return err
	}

	return nil

}
