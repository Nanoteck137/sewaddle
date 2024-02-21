package database

import (
	"context"
	"errors"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nanoteck137/sewaddle/utils"
)

type ToSQL interface {
	ToSQL() (string, []interface{}, error)
}

type Database struct {
	conn *pgxpool.Pool
}

func (db *Database) Query(ctx context.Context, s ToSQL) (pgx.Rows, error) {
	sql, params, err := s.ToSQL()
	if err != nil {
		return nil, err
	}

	return db.conn.Query(ctx, sql, params...)
}

func (db *Database) QueryRow(ctx context.Context, s ToSQL) (pgx.Row, error) {
	sql, params, err := s.ToSQL()
	if err != nil {
		return nil, err
	}

	row := db.conn.QueryRow(ctx, sql, params...)
	return row, nil
}

func (db *Database) Exec(ctx context.Context, s ToSQL) (pgconn.CommandTag, error) {
	sql, params, err := s.ToSQL()
	if err != nil {
		return pgconn.NewCommandTag(""), err
	}

	return db.conn.Exec(ctx, sql, params...)
}

var Dialect = goqu.Dialect("postgres")

func New(conn *pgxpool.Pool) *Database {
	return &Database{
		conn: conn,
	}
}

type Serie struct {
	Id           string
	Name         string
	Cover        string
	ChapterCount int `db:"count"`
}

func (db *Database) GetAllSeries(ctx context.Context) ([]Serie, error) {
	chapterCount := Dialect.
		From("chapters").
		Select(goqu.C("serieId"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serieId").
		As("chapterCount")

	ds := Dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")}))

	rows, err := db.Query(ctx, ds)
	if err != nil {
		return nil, err
	}

	var items []Serie
	for rows.Next() {
		var item Serie
		rows.Scan(&item.Id, &item.Name, &item.Cover, &item.ChapterCount)
		items = append(items, item)
	}

	return items, nil
}

func (db *Database) GetSerieById(ctx context.Context, id string) (Serie, error) {
	chapterCount := Dialect.
		From("chapters").
		Select(goqu.C("serieId"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serieId").
		As("chapterCount")

	ds := Dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")})).
		Where(goqu.C("id").Eq(id))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = row.Scan(&item.Id, &item.Name, &item.Cover, &item.ChapterCount)
	if err != nil {
		return Serie{}, err
	}

	return item, nil
}

type Chapter struct {
	Id      string
	Index   int `db:"idx"`
	Title   string
	SerieId string `db:"serieId"`
	Pages   string
}

func (db *Database) GetAllChapters(ctx context.Context) ([]Chapter, error) {
	ds := Dialect.
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
	ds := Dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId", "pages").
		Where(goqu.C("id").Eq(id)).
		Prepared(true)

	row, err := db.Query(ctx, ds)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = row.Scan(&item.Id, &item.Index, &item.SerieId, &item.Pages)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) GetSerieChaptersById(ctx context.Context, serieId string) ([]Chapter, error) {
	ds := Dialect.
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
	ds := Dialect.
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
	ds := Dialect.
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
		ds := Dialect.Insert("user_chapter_marked").Rows(goqu.Record{
			"user_id":    user_id,
			"chapter_id": chapter_id,
		}).Prepared(true)

		tag, err := db.Exec(ctx, ds)
		if err != nil {
			return err
		}

		fmt.Printf("tag: %v\n", tag)
	} else {
		ds := Dialect.Delete("user_chapter_marked").
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

type User struct {
	Id       string
	Username string
	Password string
}

func (db *Database) CreateUser(ctx context.Context, username, password string) (User, error) {
	ds := Dialect.
		Insert("users").
		Rows(goqu.Record{
			"id":       utils.CreateId(),
			"username": username,
			"password": password,
		}).
		Returning("id", "username", "password")

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return User{}, err
	}

	var item User
	err = row.Scan(&item.Id, &item.Username, &item.Password)
	if err != nil {
		return User{}, err
	}

	return item, nil
}

func (db *Database) GetUserById(ctx context.Context, id string) (User, error) {
	ds := Dialect.
		From("users").
		Select("id", "username", "password").
		Where(goqu.C("id").Eq(id))

	row, err := db.Query(ctx, ds)
	if err != nil {
		return User{}, err
	}

	var item User
	err = row.Scan(&item.Id, &item.Username, &item.Password)
	if err != nil {
		return User{}, err
	}

	return item, nil
}

func (db *Database) GetUserByUsername(ctx context.Context, username string) (User, error) {
	ds := Dialect.
		From("users").
		Select("id", "username", "password").
		Where(goqu.C("username").Eq(username))

	row, err := db.QueryRow(ctx, ds)
	if err != nil {
		return User{}, err
	}

	var item User
	err = row.Scan(&item.Id, &item.Username, &item.Password)
	if err != nil {
		return User{}, err
	}

	return item, nil
}
