package handlers

import (
	"github.com/nanoteck137/sewaddle/database"
)

type ApiConfig struct {
	database *database.Database
}

func New(database *database.Database) *ApiConfig {
	return &ApiConfig{
		database: database,
	}
}
