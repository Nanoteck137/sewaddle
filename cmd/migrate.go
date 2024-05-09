package cmd

import (
	"log"

	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/migrations"
	"github.com/pressly/goose/v3"
	"github.com/spf13/cobra"
)

var migrateCmd = &cobra.Command{
	Use: "migrate",
}

func runMigrateUp(db *database.Database) error {
	return goose.Up(db.Conn, ".")
}

var upCmd = &cobra.Command{
	Use: "up",
	Run: func(cmd *cobra.Command, args []string) {
		workDir, err := config.BootstrapDataDir()

		db, err := database.Open(workDir)
		if err != nil {
			log.Fatal(err)
		}


		err = runMigrateUp(db)
		if err != nil {
			log.Fatal(err)
		}
	},
}

var downCmd = &cobra.Command{
	Use: "down",
	Run: func(cmd *cobra.Command, args []string) {
		workDir, err := config.BootstrapDataDir()

		db, err := database.Open(workDir)
		if err != nil {
			log.Fatal(err)
		}

		err = goose.Down(db.Conn, ".")
		if err != nil {
			log.Fatal(err)
		}
	},
}

// TODO(patrik): Fix
// var createCmd = &cobra.Command{
// 	Use: "create <MIGRATION_NAME>",
// 	Args: cobra.ExactArgs(1),
// 	Run: func(cmd *cobra.Command, args []string) {
// 		name := args[0]
// 		err = goose.Create(db, "./migrations", name, "sql")
// 		if err != nil {
// 			log.Fatal(err)
// 		}
// 	},
// }

// TODO(patrik): Move to dev cmd?
var fixCmd = &cobra.Command{
	Use: "fix",
	Run: func(cmd *cobra.Command, args []string) {
		err := goose.Fix("./migrations")
		if err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	// TODO(patrik): Move?
	goose.SetBaseFS(migrations.Migrations)
	goose.SetDialect("sqlite3")

	migrateCmd.AddCommand(upCmd)
	migrateCmd.AddCommand(downCmd)
	// migrateCmd.AddCommand(createCmd)
	migrateCmd.AddCommand(fixCmd)

	rootCmd.AddCommand(migrateCmd)
}
