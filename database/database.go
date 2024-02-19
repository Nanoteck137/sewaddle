package database

import (
	"context"

	"github.com/doug-martin/goqu/v9"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nanoteck137/sewaddle/utils"
)

type Database struct {
	conn *pgxpool.Pool
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

	sql, _, err := Dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")})).
		ToSQL()
	if err != nil {
		return nil, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return nil, err
	}

	var items []Serie
	err = pgxscan.ScanAll(&items, rows)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (db *Database) GetSerieById(ctx context.Context, id string) (Serie, error) {
	chapterCount := Dialect.
		From("chapters").
		Select(goqu.C("serieId"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serieId").
		As("chapterCount")

	sql, _, err := Dialect.
		From("series").
		Select("series.id", "series.name", "series.cover", "chapterCount.count").
		Join(chapterCount, goqu.On(goqu.Ex{"series.id": goqu.C("serieId").Table("chapterCount")})).
		Where(goqu.C("id").Eq(id)).
		Limit(1).
		ToSQL()
	if err != nil {
		return Serie{}, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return Serie{}, err
	}

	var item Serie
	err = pgxscan.ScanOne(&item, rows)
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
	sql, _, err := Dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId").
		ToSQL()
	if err != nil {
		return nil, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	err = pgxscan.ScanAll(&items, rows)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (db *Database) GetChapterById(ctx context.Context, id string) (Chapter, error) {
	sql, _, err := Dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId", "pages").
		Where(goqu.C("id").Eq(id)).
		Limit(1).
		ToSQL()
	if err != nil {
		return Chapter{}, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return Chapter{}, err
	}

	var item Chapter
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return Chapter{}, err
	}

	return item, nil
}

func (db *Database) GetSerieChaptersById(ctx context.Context, serieId string) ([]Chapter, error) {
	sql, _, err := Dialect.
		From("chapters").
		Select("id", "idx", "title", "serieId").
		Where(goqu.C("serieId").Eq(serieId)).
		Order(goqu.C("idx").Asc()).
		ToSQL()
	if err != nil {
		return nil, err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return nil, err
	}

	var items []Chapter
	err = pgxscan.ScanAll(&items, rows)
	if err != nil {
		return nil, err
	}

	return items, nil
}

func (db *Database) GetNextChapter(ctx context.Context, serieId string, currentIndex int) (string, error) {
	sql, _, err := Dialect.
		From("chapters").
		Select("id").
		Where(goqu.And(goqu.C("serieId").Eq(serieId), goqu.C("idx").Gt(currentIndex))).
		Limit(1).
		Order(goqu.C("idx").Asc()).
		ToSQL()
	if err != nil {
		return "", err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return "", err
	}

	var item string
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return "", err
	}

	return item, nil
}

func (db *Database) GetPrevChapter(ctx context.Context, serieId string, currentIndex int) (string, error) {
	sql, _, err := Dialect.
		From("chapters").
		Select("id").
		Where(goqu.And(goqu.C("serieId").Eq(serieId), goqu.C("idx").Lt(currentIndex))).
		Limit(1).
		Order(goqu.C("idx").Desc()).
		ToSQL()
	if err != nil {
		return "", err
	}

	rows, err := db.conn.Query(ctx, sql)
	if err != nil {
		return "", err
	}

	var item string
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return "", err
	}

	return item, nil
}

type User struct {
	Id       string
	Username string
	Password string
}

func (db *Database) CreateUser(ctx context.Context, username, password string) (User, error) {
	sql, params, err := Dialect.
		Insert("users").
		Rows(goqu.Record{
			"id":       utils.CreateId(),
			"username": username,
			"password": password,
		}).
		Returning(goqu.C("*")).
		ToSQL()
	if err != nil {
		return User{}, err
	}

	rows, err := db.conn.Query(ctx, sql, params...)
	if err != nil {
		return User{}, err
	}

	var item User
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return User{}, err
	}

	return item, nil
}

func (db *Database) GetUserById(ctx context.Context, id string) (User, error) {
	sql, params, err := Dialect.
		From("users").
		Select("id", "username", "password").
		Where(goqu.C("id").Eq(id)).
		ToSQL()
	if err != nil {
		return User{}, err
	}

	rows, err := db.conn.Query(ctx, sql, params...)
	if err != nil {
		return User{}, err
	}

	var item User
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return User{}, err
	}

	return item, nil
}

func (db *Database) GetUserByUsername(ctx context.Context, username string) (User, error) {
	sql, params, err := Dialect.
		From("users").
		Select("id", "username", "password").
		Where(goqu.C("username").Eq(username)).
		ToSQL()
	if err != nil {
		return User{}, err
	}

	rows, err := db.conn.Query(ctx, sql, params...)
	if err != nil {
		return User{}, err
	}

	var item User
	err = pgxscan.ScanOne(&item, rows)
	if err != nil {
		return User{}, err
	}

	return item, nil
}
