package cmd

import (
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

		db, err := database.Open(workDir)
		if err != nil {
			log.Fatal(err)
		}

		server := server.New(db, workDir, config.LibraryDir)

		err = server.Start(config.ListenAddr)
		if err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
