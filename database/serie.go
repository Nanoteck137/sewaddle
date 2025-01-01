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

	CoverArt sql.NullString `db:"cover_art"`

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

			"series.cover_art",

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
		Order(goqu.I("series.name").Asc())
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

type CreateSerieParams struct {
	Id   string
	Name string

	CoverArt sql.NullString

	Created int64
	Updated int64
}

func (db *Database) CreateSerie(ctx context.Context, params CreateSerieParams) (Serie, error) {
	t := time.Now().UnixMilli()
	created := params.Created
	updated := params.Updated

	if created == 0 && updated == 0 {
		created = t
		updated = t
	}

	id := params.Id
	if id == "" {
		id = utils.CreateSerieId()
	}

	query := dialect.Insert("series").
		Rows(goqu.Record{
			"id":   id,
			"name": params.Name,

			"cover_art": params.CoverArt,

			"created": params.Created,
			"updated": params.Updated,
		}).
		Returning(
			"series.id",
			"series.name",

			"series.cover_art",

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
	Name types.Change[string]

	CoverArt types.Change[sql.NullString]

	Created types.Change[int64]
}

func (db *Database) UpdateSerie(ctx context.Context, id string, changes SerieChanges) error {
	record := goqu.Record{}

	addToRecord(record, "name", changes.Name)

	addToRecord(record, "cover_art", changes.CoverArt)

	addToRecord(record, "created", changes.Created)

	if len(record) == 0 {
		return nil
	}

	record["updated"] = time.Now().UnixMilli()

	ds := dialect.Update("series").
		Set(record).
		Where(goqu.I("series.id").Eq(id)).
		Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil
}
