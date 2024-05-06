package handlers

import (
	"github.com/golang-jwt/jwt/v5"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
)

type ApiConfig struct {
	workDir types.WorkDir
	libraryDir string
	database *database.Database
	jwtValidator *jwt.Validator
}

func New(database *database.Database, workDir types.WorkDir, libraryDir string) *ApiConfig {
	return &ApiConfig{
		workDir:      workDir,
		libraryDir:   libraryDir,
		database:     database,
		jwtValidator: jwt.NewValidator(jwt.WithIssuedAt()),
	}
}
