package database

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/doug-martin/goqu/v9"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

type Serie struct {
	Id    string         `db:"id"`
	Name  string         `db:"name"`
	Cover sql.NullString `db:"cover"`

	Created int64 `db:"created"`
	Updated int64 `db:"updated"`

	ChapterCount int64 `db:"chapter_count"`
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
			"series.id",
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

func (db *Database) GetSerieById(ctx context.Context, id string) (Serie, error) {
	query := SerieQuery().
		Where(goqu.C("series.id").Eq(id))

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

	query := dialect.Insert("series").
		Rows(goqu.Record{
			"id":  utils.CreateId(),
			"name":  params.Name,
			"cover": params.Cover,

			"created": params.Created,
			"updated": params.Updated,
		}).
		Returning("id", "name", "cover", "updated", "created").
		Prepared(true)

	var item Serie
	err := db.Get(&item, query)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}

type SerieChanges struct {
	Name  types.Change[string]
	Cover types.Change[sql.NullString]
}

func (db *Database) UpdateSerie(ctx context.Context, id string, changes SerieChanges) error {
	record := goqu.Record{}

	addToRecord(record, "name", changes.Name)
	addToRecord(record, "cover", changes.Cover)

	if len(record) <= 0 {
		return nil
	}

	record["updated"] = time.Now().UnixMilli()

	ds := dialect.Update("series").
		Set(record).
		Where(
			goqu.And(
				goqu.I("series.id").Eq(id),
			),
		).
		Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil
}
