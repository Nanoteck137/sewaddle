package database

import (
	"context"
	"errors"
	"fmt"

	"github.com/doug-martin/goqu/v9"
)

type Chapter struct {
	Id      string
	Index   int `db:"idx"`
	Title   string
	SerieId string `db:"serieId"`
	Pages   string
}

func (db *Database) GetAllChapters(ctx context.Context) ([]Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId")

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	for rows.Next() {
		var item Chapter
		rows.Scan(&item.Id, &item.Index, &item.Title, &item.SerieId)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetChapterById(ctx context.Context, id string) (Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId", "pages").
		Where(goqu.C("id").Eq(id)).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.Id, &item.Index, &item.Title, &item.SerieId, &item.Pages)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) GetSerieChaptersById(ctx context.Context, serieId string) ([]Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId").
		Where(goqu.C("serieId").Eq(serieId)).
		Order(goqu.C("idx").Asc())

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	for rows.Next() {
		var item Chapter
		rows.Scan(&item.Id, &item.Index, &item.Title, &item.SerieId)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetNextChapter(ctx context.Context, serieId string, currentIndex int) (string, error) {
	ds := dialect.
		From("chapters").
		Select("id").
		Where(goqu.And(goqu.C("serieId").Eq(serieId), goqu.C("idx").Gt(currentIndex))).
		Order(goqu.C("idx").Asc())

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return "", err
	}

	var item string
	err = row.Scan(&item)
	if err != nil {
		return "", err
	}

	return item, nil
}

func (db *Database) GetPrevChapter(ctx context.Context, serieId string, currentIndex int) (string, error) {
	ds := dialect.
		From("chapters").
		Select("id").
		Where(goqu.And(goqu.C("serieId").Eq(serieId), goqu.C("idx").Lt(currentIndex))).
		Order(goqu.C("idx").Desc())

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return "", err
	}

	var item string
	err = row.Scan(&item)
	if err != nil {
		return "", err
	}

	return item, nil
}

func (db *Database) MarkChapter(ctx context.Context, user_id, chapter_id string, mark bool) error {
	if mark {
		ds := dialect.Insert("user_chapter_marked").Rows(goqu.Record{
			"user_id":    user_id,
			"chapter_id": chapter_id,
		}).Prepared(true)

		tag, err := db.Exec(ctx, ds)
		if err != nil {
			return err
		}

		fmt.Printf("tag: %v\n", tag)
	} else {
		ds := dialect.Delete("user_chapter_marked").
			Where(goqu.And(goqu.C("user_id").Eq(user_id), goqu.C("chapter_id").Eq(chapter_id))).
			Prepared(true)

		tag, err := db.Exec(ctx, ds)
		if err != nil {
			return err
		}

		if tag.RowsAffected() == 0 {
			return errors.New("No chapter to unmark")
		}

		fmt.Printf("tag: %v\n", tag)
	}

	return nil
}
