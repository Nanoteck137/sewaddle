package database

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/doug-martin/goqu/v9"
	goqusqlite3 "github.com/doug-martin/goqu/v9/dialect/sqlite3"
	"github.com/nanoteck137/sewaddle/types"
)

var dialect = goqu.Dialect("sqlite_returning")

type ToSQL interface {
	ToSQL() (string, []interface{}, error)
}

type Database struct {
	Conn *sql.DB
}

func New(conn *sql.DB) *Database {
	return &Database{
		Conn: conn,
	}
}

func Open(workDir types.WorkDir) (*Database, error) {
	dbUrl := fmt.Sprintf("file:%s?_foreign_keys=true", workDir.DatabaseFile())

	conn, err := sql.Open("sqlite3", dbUrl)
	if err != nil {
		return nil, err
	}

	return New(conn), nil
}

func (db *Database) Query(ctx context.Context, s ToSQL) (*sql.Rows, error) {
	sql, params, err := s.ToSQL()
	if err != nil {
		return nil, err
	}

	return db.Conn.Query(sql, params...)
}

func (db *Database) QueryRow(ctx context.Context, s ToSQL) (*sql.Row, error) {
	sql, params, err := s.ToSQL()
	if err != nil {
		return nil, err
	}

	row := db.Conn.QueryRow(sql, params...)
	return row, nil
}

func (db *Database) Exec(ctx context.Context, s ToSQL) (sql.Result, error) {
	sql, params, err := s.ToSQL()
	if err != nil {
		return nil, err
	}

	return db.Conn.Exec(sql, params...)
}


func init() {
	opts := goqusqlite3.DialectOptions()
	opts.SupportsReturn = true
	goqu.RegisterDialect("sqlite_returning", opts)
}
