package handlers

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/nanoteck137/sewaddle/database"
)

type ApiConfig struct {
	database *database.Database
	jwtValidator *jwt.Validator
}

func New(database *database.Database) *ApiConfig {
	return &ApiConfig{
		database:     database,
		jwtValidator: jwt.NewValidator(jwt.WithIssuedAt()),
	}
}
