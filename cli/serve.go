package cli

import (
	"log"

	_ "github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/sewaddle/apis"
	"github.com/nanoteck137/sewaddle/config"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use: "serve",
	Run: func(cmd *cobra.Command, args []string) {
		app := core.NewBaseApp(&config.LoadedConfig)

		err := app.Bootstrap()
		if err != nil {
			log.Fatal("Failed to bootstrap app", "err", err)
		}

		// TODO(patrik): Maybe create a flag to run this on startup
		// TODO(patrik): Move to apis.Server
		err = runMigrateUp(app.DB())
		if err != nil {
			log.Fatal("Failed to run migrate up", "err", err)
		}

		e, err := apis.Server(app)
		if err != nil {
			log.Fatal("Failed to create server", "err", err)
		}

		err = e.Start(app.Config().ListenAddr)
		if err != nil {
			log.Fatal("Failed to start server", "err", err)
		}
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
