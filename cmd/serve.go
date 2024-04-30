package cmd

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/sewaddle/api"
	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use: "serve",
	Run: func(cmd *cobra.Command, args []string) {
		godotenv.Load()

		dbUrl := os.Getenv("DB_URL")
		if dbUrl == "" {
			log.Fatal("DB_URL not set")
		}

		// db, err := pgxpool.New(context.Background(), dbUrl)
		// if err != nil {
		// 	log.Fatal(err)
		// }

		db, err := sql.Open("sqlite3", dbUrl);
		if err != nil {
			log.Fatal(err)
		}

		api := api.New(db)
		if err := api.Start(":3000"); err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
