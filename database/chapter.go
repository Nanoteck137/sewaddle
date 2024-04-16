package database

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/doug-martin/goqu/v9"
	"github.com/jackc/pgx/v5"
	"github.com/nanoteck137/sewaddle/utils"
)

type Chapter struct {
	Id      string
	Index   int
	Title   string
	SerieId string
	Pages   string
	Path    string
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
		if err != pgx.ErrNoRows {
			return "", nil
		}

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
		if err != pgx.ErrNoRows {
			return "", nil
		}

		return "", err
	}

	var item string
	err = row.Scan(&item)
	if err != nil {
		if err != pgx.ErrNoRows {
			return "", err
		}
	}

	return item, nil
}

func (db *Database) MarkChapter(ctx context.Context, userId, chapterId string, mark bool) error {
	if mark {
		ds := dialect.Insert("user_chapter_marked").Rows(goqu.Record{
			"user_id":    userId,
			"chapter_id": chapterId,
		}).Prepared(true)

		tag, err := db.Exec(ctx, ds)
		if err != nil {
			return err
		}

		fmt.Printf("tag: %v\n", tag)
	} else {
		ds := dialect.Delete("user_chapter_marked").
			Where(goqu.And(goqu.C("user_id").Eq(userId), goqu.C("chapter_id").Eq(chapterId))).
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

func (db *Database) IsChapterMarked(ctx context.Context, userId, chapterId string) (bool, error) {
	ds := dialect.From("user_chapter_marked").
		Select(goqu.L("1")).
		Where(goqu.And(goqu.C("user_id").Eq(userId), goqu.C("chapter_id").Eq(chapterId))).
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return false, err
	}

	var i int
	err = row.Scan(&i)
	if err != nil {
		if err == pgx.ErrNoRows {
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
		Select("id", "idx", "title", "serieId", "path", "pages").
		Where(goqu.C("path").Eq(path))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.Id, &item.Index, &item.Title, &item.SerieId, &item.Path, &item.Pages)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) CreateChapter(ctx context.Context, index int, title, serieId, path string) (Chapter, error) {
	ds := dialect.Insert("chapters").
		Rows(goqu.Record{
			"id":      utils.CreateId(),
			"idx":     index,
			"title":   title,
			"serieId": serieId,
			"path":    path,
			"pages":   "",
		}).
		Returning("id", "idx", "title", "serieId", "path", "pages").
		Prepared(true)

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.Id, &item.Index, &item.Title, &item.SerieId, &item.Path, &item.Pages)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) UpdateChapterPages(ctx context.Context, id string, pages []string) error {
	ds := dialect.Update("chapters").
		Set(goqu.Record{"pages": strings.Join(pages, ",")}).
		Where(goqu.C("id").Eq(id)).
		Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil

}