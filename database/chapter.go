package database

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/doug-martin/goqu/v9"
	"github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

type Chapter struct {
	SerieSlug string        `db:"serie_slug"`
	Slug      string        `db:"slug"`
	Title     string        `db:"title"`
	Pages     string        `db:"pages"`
	Number    sql.NullInt64 `db:"number"`
	Created   int64         `db:"created"`
	Updated   int64         `db:"updated"`
}

func ChapterQuery() *goqu.SelectDataset {
	return dialect.From("chapters").
		Select(
			"chapters.serie_slug",
			"chapters.slug",

			"chapters.title",
			"chapters.pages",
			"chapters.number",

			"chapters.created",
			"chapters.updated",
		).
		Prepared(true).
		Order(
			goqu.I("chapters.number").Asc(),
		)
}

func (db *Database) GetAllChapters(ctx context.Context) ([]Chapter, error) {
	query := ChapterQuery()

	var items []Chapter
	err := db.Select(&items, query)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (db *Database) GetChapter(ctx context.Context, serieSlug, slug string) (Chapter, error) {
	query := ChapterQuery().
		Where(
			goqu.And(
				goqu.I("chapters.serie_slug").Eq(serieSlug),
				goqu.I("chapters.slug").Eq(slug),
			),
		)

	var item Chapter
	err := db.Get(&item, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Chapter{}, ErrItemNotFound
		}

		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) GetSerieChaptersById(ctx context.Context, serieSlug string) ([]Chapter, error) {
	query := ChapterQuery().
		Where(goqu.I("chapters.serie_slug").Eq(serieSlug))

	var items []Chapter
	err := db.Select(&items, query)
	if err != nil {
		return nil, err
	}

	return items, nil
}

var ErrAlreadyMarked = errors.New("database: chapter already marked")

// TODO(patrik): Fix
func (db *Database) MarkChapter(ctx context.Context, userId, serieSlug, chapterSlug string) error {
	ds := dialect.Insert("user_chapter_marked").Rows(goqu.Record{
		"user_id":      userId,
		"serie_slug":   serieSlug,
		"chapter_slug": chapterSlug,
	}).Prepared(true)

	tag, err := db.Exec(ctx, ds)
	if err != nil {
		var sqlerr sqlite3.Error
		if errors.As(err, &sqlerr) {
			if sqlerr.ExtendedCode == sqlite3.ErrConstraintPrimaryKey {
				return ErrAlreadyMarked
			}
		}

		return err
	}

	fmt.Printf("tag: %v\n", tag)

	return nil
}

func (db *Database) UnmarkChapter(ctx context.Context, userId, serieSlug, chapterSlug string) error {
	ds := dialect.Delete("user_chapter_marked").
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("serie_slug").Eq(serieSlug),
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

func (db *Database) GetAllMarkedChapters(ctx context.Context, userId, serieSlug string) ([]string, error) {
	ds := dialect.From("user_chapter_marked").
		Select("chapter_slug").
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("serie_slug").Eq(serieSlug),
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

func (db *Database) IsChapterMarked(ctx context.Context, userId, serieSlug, chapterSlug string) (bool, error) {
	ds := dialect.From("user_chapter_marked").
		Select(goqu.L("1")).
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("serie_slug").Eq(serieSlug),
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

	return true, nil
}

type CreateChapterParams struct {
	SerieSlug string
	Slug      string
	Title     string
	Pages     string
	Number    sql.NullInt64
	Created   int64
	Updated   int64
}

func (db *Database) CreateChapter(ctx context.Context, params CreateChapterParams) (Chapter, error) {
	// TODO(patrik): Trim space here?

	if params.Created == 0 && params.Updated == 0 {
		t := time.Now().UnixMilli()
		params.Created = t
		params.Updated = t
	}

	if params.Slug == "" {
		params.Slug = utils.Slug(params.Title)
	}

	query := dialect.Insert("chapters").
		Rows(goqu.Record{
			"serie_slug": params.SerieSlug,
			"slug":       params.Slug,

			"title":  params.Title,
			"pages":  params.Pages,
			"number": params.Number,

			"created": params.Created,
			"updated": params.Updated,
		}).
		Returning("serie_slug", "slug", "title", "pages", "number", "created", "updated").
		Prepared(true)

	var item Chapter
	err := db.Get(&item, query)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

// TODO(patrik): Move
func addToRecord[T any](record goqu.Record, name string, change types.Change[T]) {
	if change.Changed {
		record[name] = change.Value
	}
}

type ChapterChanges struct {
	Title     types.Change[string]
	Pages     types.Change[string]
	Number    types.Change[sql.NullInt64]
}

func (db *Database) UpdateChapter(ctx context.Context, serieSlug, slug string, changes ChapterChanges) error {
	record := goqu.Record{}

	addToRecord(record, "name", changes.Title)
	addToRecord(record, "pages", changes.Pages)
	addToRecord(record, "number", changes.Number)

	if len(record) <= 0 {
		return nil
	}

	record["updated"] = time.Now().UnixMilli()

	ds := dialect.Update("chapters").
		Set(record).
		Where(
			goqu.And(
				goqu.I("chapters.serie_slug").Eq(serieSlug),
				goqu.I("chapters.slug").Eq(slug),
			),
		).
		Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) UpdateChapterPages(ctx context.Context, serieSlug, slug string, pages []string, number int) error {
	ds := dialect.Update("chapters").
		Set(
			goqu.Record{
				"pages":  strings.Join(pages, ","),
				"number": number,
			},
		).
		Where(
			goqu.And(
				goqu.C("serie_slug").Eq(serieSlug),
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
