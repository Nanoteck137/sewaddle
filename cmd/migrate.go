package cmd

import (
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
	"github.com/joho/godotenv"
	"github.com/nanoteck137/sewaddle/migrations"
	"github.com/pressly/goose/v3"
	"github.com/spf13/cobra"
)

var migrateCmd = &cobra.Command{
	Use: "migrate",
}

var upCmd = &cobra.Command{
	Use: "up",
	Run: func(cmd *cobra.Command, args []string) {
		godotenv.Load()

		dbUrl := os.Getenv("DB_URL")
		if dbUrl == "" {
			log.Fatal("DB_URL not set")
		}

		db, err := goose.OpenDBWithDriver("pgx", dbUrl)
		if err != nil {
			log.Fatalf("goose: failed to open DB: %v\n", err)
		}

		err = goose.Up(db, ".")
		if err != nil {
			log.Fatal(err)
		}
	},
}

var downCmd = &cobra.Command{
	Use: "down",
	Run: func(cmd *cobra.Command, args []string) {
		godotenv.Load()

		dbUrl := os.Getenv("DB_URL")
		if dbUrl == "" {
			log.Fatal("DB_URL not set")
		}

		db, err := goose.OpenDBWithDriver("pgx", dbUrl)
		if err != nil {
			log.Fatalf("goose: failed to open DB: %v\n", err)
		}

		err = goose.Down(db, ".")
		if err != nil {
			log.Fatal(err)
		}
	},
}

var createCmd = &cobra.Command{
	Use: "create <MIGRATION_NAME>",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		godotenv.Load()

		dbUrl := os.Getenv("DB_URL")
		if dbUrl == "" {
			log.Fatal("DB_URL not set")
		}

		db, err := goose.OpenDBWithDriver("pgx", dbUrl)
		if err != nil {
			log.Fatalf("goose: failed to open DB: %v\n", err)
		}

		name := args[0]
		err = goose.Create(db, "./migrations", name, "sql")
		if err != nil {
			log.Fatal(err)
		}
	},
}

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
	goose.SetBaseFS(migrations.Migrations)

	migrateCmd.AddCommand(upCmd)
	migrateCmd.AddCommand(downCmd)
	migrateCmd.AddCommand(createCmd)
	migrateCmd.AddCommand(fixCmd)

	rootCmd.AddCommand(migrateCmd)
}
