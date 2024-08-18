package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/doug-martin/goqu/v9"
	"github.com/nanoteck137/sewaddle/types"
)

type Chapter struct {
	Slug    string
	Title   string
	SerieId string
	Pages   string
	Path    string
	Number  int
}

func (db *Database) GetAllChapters(ctx context.Context) ([]Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("serie_id", "slug", "title")

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	for rows.Next() {
		var item Chapter
		rows.Scan(&item.SerieId, &item.Slug, &item.Title)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetChapter(ctx context.Context, serieId, slug string) (Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("serie_id", "slug", "title", "pages", "number").
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("slug").Eq(slug),
			),
		).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.SerieId, &item.Slug, &item.Title, &item.Pages, &item.Number)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Chapter{}, types.ErrNoChapter
		}

		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) GetSerieChaptersById(ctx context.Context, serieId string) ([]Chapter, error) {
	ds := dialect.
		From("chapters").
		Select("serie_id", "slug", "title", "pages").
		Where(goqu.C("serie_id").Eq(serieId)).
		Order(goqu.C("title").Asc())

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	for rows.Next() {
		var item Chapter
		rows.Scan(&item.SerieId, &item.Slug, &item.Title, &item.Pages)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetNextChapter(ctx context.Context, serieId string, currentNumber int) (string, error) {
	ds := dialect.
		From("chapters").
		Select("slug").
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("number").Gt(currentNumber),
			),
		).
		Order(goqu.C("number").Asc())

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return "", err
	}

	var item string
	err = row.Scan(&item)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}

		return "", err
	}

	return item, nil
}

func (db *Database) GetPrevChapter(ctx context.Context, serieId string, currentNumber int) (string, error) {
	ds := dialect.
		From("chapters").
		Select("slug").
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("number").Lt(currentNumber),
			),
		).
		Order(goqu.C("number").Desc())

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return "", err
	}

	var item string
	err = row.Scan(&item)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}

		return "", err
	}

	return item, nil
}

// TODO(patrik): Fix
func (db *Database) MarkChapter(ctx context.Context, userId, serieId, chapterSlug string) error {
	ds := dialect.Insert("user_chapter_marked").Rows(goqu.Record{
		"user_id":      userId,
		"serie_id":     serieId,
		"chapter_slug": chapterSlug,
	}).Prepared(true)

	tag, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	fmt.Printf("tag: %v\n", tag)

	return nil
}

func (db *Database) UnmarkChapter(ctx context.Context, userId, serieId, chapterSlug string) error {
	ds := dialect.Delete("user_chapter_marked").
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("serie_id").Eq(serieId),
				goqu.C("chapter_slug").Eq(chapterSlug),
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

	return nil
}

func (db *Database) GetAllMarkedChapters(ctx context.Context, userId, serieId string) ([]string, error) {
	ds := dialect.From("user_chapter_marked").
		Select("chapter_slug").
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

	var items []string
	for rows.Next() {
		var item string
		rows.Scan(&item)

		items = append(items, item)
	}

	return items, nil
}

func (db *Database) IsChapterMarked(ctx context.Context, userId, serieId, chapterSlug string) (bool, error) {
	ds := dialect.From("user_chapter_marked").
		Select(goqu.L("1")).
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("serie_id").Eq(serieId),
				goqu.C("chapter_slug").Eq(chapterSlug),
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
		Select("serie_id", "slug", "title", "path", "pages").
		Where(goqu.C("path").Eq(path))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.SerieId, &item.Slug, &item.Title, &item.Path, &item.Pages)
	if err != nil {
		// TODO(patrik): Return ErrNoChapter
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) CreateChapter(ctx context.Context, slug, title, serieId, path string) (Chapter, error) {
	ds := dialect.Insert("chapters").
		Rows(goqu.Record{
			"slug":     slug,
			"serie_id": serieId,
			"title":    title,
			"pages":    "",
			"path":     path,
			"number":   0,
		}).
		Returning("serie_id", "slug", "title", "pages", "path").
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.SerieId, &item.Slug, &item.Title, &item.Pages, &item.Path)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) UpdateChapterPages(ctx context.Context, serieId, slug string, pages []string, number int) error {
	ds := dialect.Update("chapters").
		Set(
			goqu.Record{
				"pages":  strings.Join(pages, ","),
				"number": number,
			},
		).
		Where(
			goqu.And(
				goqu.C("serie_id").Eq(serieId),
				goqu.C("slug").Eq(slug),
			),
		).
		Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil

}
