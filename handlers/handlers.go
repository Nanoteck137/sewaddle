package handlers

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
)

type ApiConfig struct {
	workDir types.WorkDir
	database *database.Database
	jwtValidator *jwt.Validator
}

func New(database *database.Database, workDir types.WorkDir) *ApiConfig {
	return &ApiConfig{
		workDir:      workDir,
		database:     database,
		jwtValidator: jwt.NewValidator(jwt.WithIssuedAt()),
	}
}
