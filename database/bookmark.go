package database

import (
	"context"
	"database/sql"
	"errors"

	"github.com/doug-martin/goqu/v9"
)

type Bookmark struct {
	UserId    string
	SerieId   string
	ChapterId string
}

func (db *Database) GetBookmark(ctx context.Context, userId, serieSlug string) (Bookmark, error) {
	ds := dialect.From("user_bookmark").
		Select("user_id", "serie_slug", "chapter_slug").
		Where(
			goqu.And(
				goqu.I("user_id").Eq(userId),
				goqu.I("serie_slug").Eq(serieSlug),
			),
		).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)

	var item Bookmark
	err = row.Scan(&item.UserId, &item.SerieId, &item.ChapterId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Bookmark{}, ErrItemNotFound
		}

		return Bookmark{}, err
	}

	return item, nil
}

func (db *Database) HasBookmark(ctx context.Context, userId, serieSlug string) (bool, error) {
	ds := dialect.From("user_bookmark").
		Select(goqu.L("1")).
		Where(
			goqu.And(
				goqu.I("user_id").Eq(userId),
				goqu.I("serie_slug").Eq(serieSlug),
			),
		).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return false, err
	}

	var tmp int
	err = row.Scan(&tmp)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return false, nil
		}

		return false, err
	}

	return true, nil
}

func (db *Database) CreateBookmark(ctx context.Context, userId, serieSlug, chapterSlug string) error {
	ds := dialect.Insert("user_bookmark").Rows(goqu.Record{
		"user_id":      userId,
		"serie_slug":   serieSlug,
		"chapter_slug": chapterSlug,
	})

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) UpdateBookmark(ctx context.Context, userId, serieSlug, chapterSlug string) error {
	ds := dialect.Update("user_bookmark").Set(goqu.Record{
		"chapter_slug": chapterSlug,
	}).Where(
		goqu.And(
			goqu.I("user_id").Eq(userId),
			goqu.I("serie_slug").Eq(serieSlug),
		),
	).Prepared(true)

	// TODO(patrik): Should we check sql.Result?
	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil
}
