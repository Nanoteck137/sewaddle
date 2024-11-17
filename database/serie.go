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
	Id   string `db:"id"`
	Name string `db:"name"`

	CoverOriginal sql.NullString `db:"cover_original"`
	CoverLarge    sql.NullString `db:"cover_large"`
	CoverMedium   sql.NullString `db:"cover_medium"`
	CoverSmall    sql.NullString `db:"cover_small"`

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

			"series.cover_original",
			"series.cover_large",
			"series.cover_medium",
			"series.cover_small",

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
		Where(goqu.I("series.id").Eq(id))

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
	Name string

	CoverOriginal sql.NullString
	CoverLarge    sql.NullString
	CoverMedium   sql.NullString
	CoverSmall    sql.NullString

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
			"id":   utils.CreateId(),
			"name": params.Name,

			"cover_original": params.CoverOriginal,
			"cover_large":    params.CoverLarge,
			"cover_medium":   params.CoverMedium,
			"cover_small":    params.CoverSmall,

			"created": params.Created,
			"updated": params.Updated,
		}).
		Returning(
			"series.id",
			"series.name",

			"series.cover_original",
			"series.cover_large",
			"series.cover_medium",
			"series.cover_small",

			"series.created",
			"series.updated",
		).
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

	CoverOriginal types.Change[sql.NullString]
	CoverLarge types.Change[sql.NullString]
	CoverMedium types.Change[sql.NullString]
	CoverSmall types.Change[sql.NullString]
}

func (db *Database) UpdateSerie(ctx context.Context, id string, changes SerieChanges) error {
	record := goqu.Record{}

	addToRecord(record, "name", changes.Name)

	addToRecord(record, "cover_original", changes.CoverOriginal)
	addToRecord(record, "cover_large", changes.CoverLarge)
	addToRecord(record, "cover_medium", changes.CoverMedium)
	addToRecord(record, "cover_small", changes.CoverSmall)

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
