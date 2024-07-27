package core

import (
	"github.com/nanoteck137/sewaddle/config"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
)

// Inspiration from Pocketbase: https://github.com/pocketbase/pocketbase
// File: https://github.com/pocketbase/pocketbase/blob/master/core/app.go
type App interface {
	DB() *database.Database
	Config() *config.Config
	DBConfig() *database.Config

	WorkDir() types.WorkDir

	IsSetup() bool
	InvalidateDBConfig() error

	Bootstrap() error
}
