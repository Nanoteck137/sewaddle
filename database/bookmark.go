package database

import (
	"context"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	"github.com/jackc/pgx/v5"
	"github.com/nanoteck137/sewaddle/types"
)

type Bookmark struct {
	UserId        string
	SerieId       string
	ChapterNumber int
	Page          int
}

func (db *Database) GetBookmark(ctx context.Context, userId, serieId string) (Bookmark, error) {
	ds := dialect.From("user_bookmark").
		Select("user_id", "serie_id", "chapter_number", "page").
		Where(
			goqu.And(
				goqu.I("user_id").Eq(userId),
				goqu.I("serie_id").Eq(serieId),
			),
		).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)

	var item Bookmark
	err = row.Scan(&item.UserId, &item.SerieId, &item.ChapterNumber, &item.Page)
	if err != nil {
		if err == pgx.ErrNoRows {
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
		if err == pgx.ErrNoRows {
			return false, nil
		}

		return false, err
	}

	return true, nil
}

func (db *Database) CreateBookmark(ctx context.Context, userId, serieId string, chapterNumber, page int) error {
	ds := dialect.Insert("user_bookmark").Rows(goqu.Record{
		"user_id":        userId,
		"serie_id":       serieId,
		"chapter_number": chapterNumber,
		"page":           page,
	})

	tag, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	fmt.Printf("tag: %v\n", tag)

	return nil
}

func (db *Database) UpdateBookmark(ctx context.Context, userId, serieId string, chapterNumber, page int) error {
	ds := dialect.Update("user_bookmark").Set(goqu.Record{
		"chapter_number": chapterNumber,
		"page":           page,
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
