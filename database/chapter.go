package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/doug-martin/goqu/v9"
)

type Chapter struct {
	SerieId string
	Number  int
	Title   string
	Pages   string
	Path    string
}

func (db *Database) GetAllChapters(ctx context.Context) ([]Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("serie_id", "number", "title")

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	for rows.Next() {
		var item Chapter
		rows.Scan(&item.SerieId, &item.Number, &item.Title)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetChapter(ctx context.Context, serieId string, chapterNumber int) (Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("serie_id", "number", "title", "pages").
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("number").Eq(chapterNumber),
			),
		).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.SerieId, &item.Number, &item.Title, &item.Pages)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) GetSerieChaptersById(ctx context.Context, serieId string) ([]Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("serie_id", "number", "title", "pages").
		Where(goqu.C("serie_id").Eq(serieId)).
		Order(goqu.C("number").Asc())

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	for rows.Next() {
		var item Chapter
		rows.Scan(&item.SerieId, &item.Number, &item.Title, &item.Pages)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetNextChapter(ctx context.Context, serieId string, currentChapterNumber int) (int, error) {
	ds := dialect.
		From("chapters").
		Select("number").
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("number").Gt(currentChapterNumber),
			),
		).
		Order(goqu.C("number").Asc())

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return 0, err
	}

	var item int
	err = row.Scan(&item)
	if err != nil {
		if err == sql.ErrNoRows {
			return -1, nil
		}

		return 0, err
	}

	return item, nil
}

func (db *Database) GetPrevChapter(ctx context.Context, serieId string, currentChapterNumber int) (int, error) {
	ds := dialect.
		From("chapters").
		Select("number").
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("number").Lt(currentChapterNumber),
			),
		).
		Order(goqu.C("number").Desc())

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return 0, err
	}

	var item int
	err = row.Scan(&item)
	if err != nil {
		if err == sql.ErrNoRows {
			return -1, nil
		}

		return 0, err
	}

	return item, nil
}

// TODO(patrik): Fix
func (db *Database) MarkChapter(ctx context.Context, userId, serieId string, chapterNumber int, mark bool) error {
	if mark {
		ds := dialect.Insert("user_chapter_marked").Rows(goqu.Record{
			"user_id":        userId,
			"serie_id":       serieId,
			"chapter_number": chapterNumber,
		}).Prepared(true)

		tag, err := db.Exec(ctx, ds)
		if err != nil {
			return err
		}

		fmt.Printf("tag: %v\n", tag)
	} else {
		ds := dialect.Delete("user_chapter_marked").
			Where(
				goqu.And(
					goqu.C("user_id").Eq(userId),
					goqu.C("serie_id").Eq(serieId),
					goqu.C("chapter_number").Eq(chapterNumber),
				),
			).
			Prepared(true)

		tag, err := db.Exec(ctx, ds)
		if err != nil {
			return err
		}

		rowsAffected, err := tag.RowsAffected()
		if rowsAffected == 0 {
			return errors.New("No chapter to unmark")
		}

		fmt.Printf("tag: %v\n", tag)
	}

	return nil
}

func (db *Database) GetAllMarkedChapters(ctx context.Context, userId, serieId string) ([]int, error) {
	ds := dialect.From("user_chapter_marked").
		Select("chapter_number").
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("serie_id").Eq(serieId),
			),
		).
		Prepared(true)

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []int
	for rows.Next() {
		var item int
		rows.Scan(&item)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) IsChapterMarked(ctx context.Context, userId, serieId string, chapterNumber int) (bool, error) {
	ds := dialect.From("user_chapter_marked").
		Select(goqu.L("1")).
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("serie_id").Eq(serieId),
				goqu.C("chapter_number").Eq(chapterNumber),
			),
		).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return false, err
	}

	var i int
	err = row.Scan(&i)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}

		return false, err
	}

	fmt.Printf("i: %v\n", i)

	return true, nil
}

func (db *Database) GetChapterByPath(ctx context.Context, path string) (Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("serie_id", "number", "title", "path", "pages").
		Where(goqu.C("path").Eq(path))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.SerieId, &item.Number, &item.Title, &item.Path, &item.Pages)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) CreateChapter(ctx context.Context, index int, title, serieId, path string) (Chapter, error) {
	ds := dialect.Insert("chapters").
		Rows(goqu.Record{
			"serie_id": serieId,
			"number":   index,
			"title":    title,
			"path":     path,
			"pages":    "",
		}).
		Returning("serie_id", "number", "title", "path", "pages").
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.SerieId, &item.Number, &item.Title, &item.Path, &item.Pages)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) UpdateChapterPages(ctx context.Context, serieId string, chapterNumber int, pages []string) error {
	ds := dialect.Update("chapters").
		Set(goqu.Record{"pages": strings.Join(pages, ",")}).
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("number").Eq(chapterNumber),
			),
		).
		Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil

}
