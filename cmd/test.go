package cmd

import (
	"context"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/nanoteck137/sewaddle/library"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/spf13/cobra"
)

var testCmd = &cobra.Command{
	Use: "test",
	Run: func(cmd *cobra.Command, args []string) {
		godotenv.Load()

		dbUrl := os.Getenv("DB_URL")
		if dbUrl == "" {
			log.Fatal("DB_URL not set")
		}

		db, err := pgxpool.New(context.Background(), dbUrl)
		if err != nil {
			log.Fatal(err)
		}

		lib, err := library.ReadFromDir("/Volumes/manga")
		if err != nil {
			log.Fatal(err)
		}

		workDir := types.WorkDir("./work")
		lib.Sync(db, workDir)
	},
}

func init() {
	rootCmd.AddCommand(testCmd)
}
