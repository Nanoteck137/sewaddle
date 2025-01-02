package database

import (
	"context"
	"database/sql"
	"errors"
	"sort"
	"time"

	"github.com/doug-martin/goqu/v9"
	"github.com/maruel/natural"
	"github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

type Chapter struct {
	Id   string `db:"id"`
	Name string `db:"name"`

	SerieId string `db:"serie_id"`

	Pages    string         `db:"pages"`
	Number   int64          `db:"number"`
	CoverArt sql.NullString `db:"cover_art"`

	Created int64 `db:"created"`
	Updated int64 `db:"updated"`
}

func ChapterQuery() *goqu.SelectDataset {
	return dialect.From("chapters").
		Select(
			"chapters.id",
			"chapters.name",

			"chapters.serie_id",

			"chapters.pages",
			"chapters.number",
			"chapters.cover_art",

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

func (db *Database) GetChapterById(ctx context.Context, id string) (Chapter, error) {
	query := ChapterQuery().
		Where(goqu.I("chapters.id").Eq(id))

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

func (db *Database) GetSerieChapters(ctx context.Context, serieId string) ([]Chapter, error) {
	query := ChapterQuery().
		Where(goqu.I("chapters.serie_id").Eq(serieId))

	var items []Chapter
	err := db.Select(&items, query)
	if err != nil {
		return nil, err
	}

	return items, nil
}

var ErrAlreadyMarked = errors.New("database: chapter already marked")

// TODO(patrik): Fix
func (db *Database) MarkChapter(ctx context.Context, userId, chapterId string) error {
	ds := dialect.Insert("user_chapter_marked").Rows(goqu.Record{
		"user_id":    userId,
		"chapter_id": chapterId,
	}).Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		var sqlerr sqlite3.Error
		if errors.As(err, &sqlerr) {
			if sqlerr.ExtendedCode == sqlite3.ErrConstraintPrimaryKey {
				return ErrAlreadyMarked
			}
		}

		return err
	}

	return nil
}

func (db *Database) UnmarkChapter(ctx context.Context, userId, chapterId string) error {
	ds := dialect.Delete("user_chapter_marked").
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("chapter_id").Eq(chapterId),
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

	return nil
}

func (db *Database) GetAllMarkedChapters(ctx context.Context, userId, serieId string) ([]string, error) {
	// TODO(patrik): FIIIIX
	ds := dialect.From("user_chapter_marked").
		Select("chapter_id").
		Join(
			goqu.I("chapters"),
			goqu.On(goqu.I("chapters.id").Eq(goqu.I("user_chapter_marked.chapter_id"))),
		).
		Where(
			goqu.And(
				goqu.I("user_chapter_marked.user_id").Eq(userId),
				goqu.I("chapters.serie_id").Eq(serieId),
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

func (db *Database) IsChapterMarked(ctx context.Context, userId, chapterId string) (bool, error) {
	ds := dialect.From("user_chapter_marked").
		Select(goqu.L("1")).
		Where(
			goqu.And(
				goqu.C("user_id").Eq(userId),
				goqu.C("chapter_id").Eq(chapterId),
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
	Id   string
	Name string

	SerieId string

	Pages    string
	Number   int64
	CoverArt sql.NullString

	Created int64
	Updated int64
}

func (db *Database) CreateChapter(ctx context.Context, params CreateChapterParams) (Chapter, error) {
	t := time.Now().UnixMilli()
	created := params.Created
	updated := params.Updated

	if created == 0 && updated == 0 {
		created = t
		updated = t
	}

	id := params.Id
	if id == "" {
		id = utils.CreateChapterId()
	}

	query := dialect.Insert("chapters").
		Rows(goqu.Record{
			"id":   id,
			"name": params.Name,

			"serie_id": params.SerieId,

			"pages":     params.Pages,
			"number":    params.Number,
			"cover_art": params.CoverArt,

			"created": created,
			"updated": updated,
		}).
		Returning(
			"chapters.id",
			"chapters.name",

			"chapters.serie_id",

			"chapters.pages",
			"chapters.number",
			"chapters.cover_art",

			"chapters.created",
			"chapters.updated",
		).
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
	Name types.Change[string]

	SerieId types.Change[string]

	Pages    types.Change[string]
	Number   types.Change[int64]
	CoverArt types.Change[sql.NullString]

	Created types.Change[int64]
}

func (db *Database) UpdateChapter(ctx context.Context, id string, changes ChapterChanges) error {
	record := goqu.Record{}

	addToRecord(record, "name", changes.Name)

	addToRecord(record, "serie_id", changes.SerieId)

	addToRecord(record, "pages", changes.Pages)
	addToRecord(record, "number", changes.Number)
	addToRecord(record, "cover_art", changes.CoverArt)

	addToRecord(record, "created", changes.Created)

	if len(record) <= 0 {
		return nil
	}

	record["updated"] = time.Now().UnixMilli()

	ds := dialect.Update("chapters").
		Set(record).
		Where(
			goqu.I("chapters.id").Eq(id),
		).
		Prepared(true)

	_, err := db.Exec(ctx, ds)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) RemoveChapter(ctx context.Context, id string) error {
	query := dialect.Delete("chapters").
		Prepared(true).
		Where(goqu.I("chapters.id").Eq(id))

	_, err := db.Exec(ctx, query)
	if err != nil {
		return err
	}

	return nil
}

func (db *Database) RecalculateNumberForSerie(ctx context.Context, serieId string) error {
	db, tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	chapters, err := db.GetSerieChapters(ctx, serieId)
	if err != nil {
		return err
	}

	if len(chapters) <= 1 {
		return nil
	}

	sort.SliceStable(chapters, func(i, j int) bool {
		return natural.Less(chapters[i].Name, chapters[j].Name)
	})

	for i, c := range chapters {
		err := db.UpdateChapter(ctx, c.Id, ChapterChanges{
			Number: types.Change[int64]{
				Value:   int64(i),
				Changed: true,
			},
		})
		if err != nil {
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}
