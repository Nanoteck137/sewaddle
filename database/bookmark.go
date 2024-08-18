package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	"github.com/nanoteck137/sewaddle/types"
)

type Bookmark struct {
	UserId      string
	SerieId     string
	ChapterSlug int
	Page        int
}

func (db *Database) GetBookmark(ctx context.Context, userId, serieId string) (Bookmark, error) {
	ds := dialect.From("user_bookmark").
		Select("user_id", "serie_id", "chapter_slug", "page").
		Where(
			goqu.And(
				goqu.I("user_id").Eq(userId),
				goqu.I("serie_id").Eq(serieId),
			),
		).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)

	var item Bookmark
	err = row.Scan(&item.UserId, &item.SerieId, &item.ChapterSlug, &item.Page)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Bookmark{}, types.ErrNoBookmark
		}

		return Bookmark{}, err
	}

	return item, nil
}

func (db *Database) HasBookmark(ctx context.Context, userId, serieId string) (bool, error) {
	ds := dialect.From("user_bookmark").
		Select(goqu.L("1")).
		Where(
			goqu.And(
				goqu.I("user_id").Eq(userId),
				goqu.I("serie_id").Eq(serieId),
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

func (db *Database) CreateBookmark(ctx context.Context, userId, serieId, chapterSlug string, page int) error {
	ds := dialect.Insert("user_bookmark").Rows(goqu.Record{
		"user_id":      userId,
		"serie_id":     serieId,
		"chapter_slug": chapterSlug,
		"page":         page,
	})

	tag, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	fmt.Printf("tag: %v\n", tag)

	return nil
}

func (db *Database) UpdateBookmark(ctx context.Context, userId, serieId, chapterSlug string, page int) error {
	ds := dialect.Update("user_bookmark").Set(goqu.Record{
		"chapter_slug": chapterSlug,
		"page":         page,
	}).Where(
		goqu.And(
			goqu.I("user_id").Eq(userId),
			goqu.I("serie_id").Eq(serieId),
		),
	).Prepared(true)

	tag, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	fmt.Printf("tag: %v\n", tag)

	return nil
}
