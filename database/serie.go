package database

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/doug-martin/goqu/v9"
	"github.com/nanoteck137/sewaddle/utils"
)

type Serie struct {
	Slug         string         `db:"slug"`
	Name         string         `db:"name"`
	Cover        sql.NullString `db:"cover"`

	Created      int64          `db:"created"`
	Updated      int64          `db:"updated"`

	ChapterCount int64          `db:"chapter_count"`
}

func SerieQuery() *goqu.SelectDataset {
	// TODO(patrik): Fix
	// chapterCount := dialect.From("chapters").
	// 	Select(
	// 		"chapters.serie_slug",
	// 		goqu.COUNT(goqu.I("chapters.slug")).As("count"),
	// 	).
	// 	GroupBy("chapters.serie_slug").
	// 	As("chapter_count")

	return dialect.From("series").
		Select(
			"series.slug",
			"series.name",
			"series.cover",

			"series.created",
			"series.updated",

			// goqu.I("chapter_count.count").As("chapter_count"),
		).
		Prepared(true).
		// Join(
		// 	chapterCount,
		// 	goqu.On(
		// 		goqu.Ex{
		// 			"series.slug": goqu.C("serie_slug").Table("chapter_count"),
		// 		},
		// 	),
		// ).
		Order(
			goqu.I("series.name").Asc(),
		)
}

func (db *Database) GetAllSeries(ctx context.Context) ([]Serie, error) {
	query := SerieQuery()

	var items []Serie
	err := db.Select(&items, query)
	if err != nil {
		return nil, err
	}

	return items, nil
}

// TODO(patrik): Rename to GetSerieBySlug
func (db *Database) GetSerieById(ctx context.Context, slug string) (Serie, error) {
	query := SerieQuery().
		Where(goqu.C("slug").Eq(slug))

	var item Serie
	err := db.Get(&item, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Serie{}, ErrItemNotFound
		}

		return Serie{}, err
	}

	return item, nil
}

func (db *Database) GetSerieByName(ctx context.Context, name string) (Serie, error) {
	query := SerieQuery().
		Where(goqu.I("series.name").Eq(name))

	var item Serie
	err := db.Get(&item, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Serie{}, ErrItemNotFound
		}

		return Serie{}, err
	}

	return item, nil
}

type CreateSerieParams struct {
	Slug    string
	Name    string
	Cover   sql.NullString
	Updated int64
	Created int64
}

func (db *Database) CreateSerie(ctx context.Context, params CreateSerieParams) (Serie, error) {
	if params.Created == 0 && params.Updated == 0 {
		t := time.Now().UnixMilli()
		params.Created = t
		params.Updated = t
	}

	if params.Slug == "" {
		params.Slug = utils.Slug(params.Name)
	}

	query := dialect.Insert("series").
		Rows(goqu.Record{
			"slug":  params.Slug,
			"name":  params.Name,
			"cover": params.Cover,

			"created": params.Created,
			"updated": params.Updated,
		}).
		Returning("slug", "name", "cover", "updated", "created").
		Prepared(true)

	var item Serie
	err := db.Get(&item, query)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}

func (db *Database) UpdateSerieCover(ctx context.Context, slug string, coverPath sql.NullString) error {
	// ds := dialect.Update("series").
	// 	Set(goqu.Record{"cover": coverPath}).
	// 	Where(goqu.C("slug").Eq(slug)).
	// 	Prepared(true)
	//
	// _, err := db.Exec(context.Background(), ds)
	// if err != nil {
	// 	return err
	// }
	//
	// return nil
	return nil
}
