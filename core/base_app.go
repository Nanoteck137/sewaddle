package core

import (
	"context"
	"errors"
	"os"

	"github.com/nanoteck137/sewaddle/config"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
)

var _ App = (*BaseApp)(nil)

type BaseApp struct {
	db       *database.Database
	config   *config.Config
	dbConfig *database.Config
}

func (app *BaseApp) DB() *database.Database {
	return app.db
}

func (app *BaseApp) Config() *config.Config {
	return app.config
}

func (app *BaseApp) DBConfig() *database.Config {
	return app.dbConfig
}

func (app *BaseApp) WorkDir() types.WorkDir {
	return app.config.WorkDir()
}

func (app *BaseApp) IsSetup() bool {
	return app.dbConfig != nil
}

func (app *BaseApp) Bootstrap() error {
	var err error

	workDir := app.config.WorkDir()

	dirs := []string{
		workDir.SeriesDir(),
		workDir.ChaptersDir(),
		workDir.Trash(),
	}

	for _, dir := range dirs {
		err = os.Mkdir(dir, 0755)
		if err != nil && !os.IsExist(err) {
			return err
		}
	}

	app.db, err = database.Open(workDir)
	if err != nil {
		return err
	}

	err = app.db.RunMigrateUp()
	if err != nil {
		return err
	}

	_, err = os.Stat(workDir.SetupFile())
	if errors.Is(err, os.ErrNotExist) {
		log.Info("Server not setup, creating the initial user")

		ctx := context.Background()

		_, err := app.db.CreateUser(ctx, database.CreateUserParams{
			Username: app.config.Username,
			Password: app.config.InitialPassword,
			Role:     types.RoleSuperUser,
		})
		if err != nil {
			return err
		}

		f, err := os.Create(workDir.SetupFile())
		if err != nil {
			return err
		}
		f.Close()
	}

	return nil
}

func NewBaseApp(config *config.Config) *BaseApp {
	return &BaseApp{
		config: config,
	}
}
