package cmd

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/server"
	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use: "serve",
	Run: func(cmd *cobra.Command, args []string) {
		workDir, err := config.BootstrapDataDir()
		if err != nil {
			log.Fatal(err)
		}

		// TODO(patrik): Move to util function inside config or workdir or something
		dbUrl := fmt.Sprintf("file:%s?_foreign_keys=true", workDir.DatabaseFile())

		conn, err := sql.Open("sqlite3", dbUrl);
		if err != nil {
			log.Fatal(err)
		}

		db := database.New(conn)

		server := server.New(db, workDir)

		err = server.Start(config.ListenAddr)
		if err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
