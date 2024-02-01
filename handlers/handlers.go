package handlers

import (
	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ApiConfig struct {
	db *pgxpool.Pool
	dialect goqu.DialectWrapper
}

func New(db *pgxpool.Pool) *ApiConfig {
	return &ApiConfig{
		db: db,
		dialect: goqu.Dialect("postgres"),
	}
}
