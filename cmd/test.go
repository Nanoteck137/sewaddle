package cmd

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"github.com/nanoteck137/sewaddle/database"
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


type MarkedChapter struct {
	SerieTitle    string `json:"serieTitle"`
	ChapterNumber int    `json:"chapterNumber"`
}

type BookmarkedChapter struct {
	SerieTitle    string `json:"serieTitle"`
	ChapterNumber int    `json:"chapterNumber"`
	Page          int    `json:"page"`
}

type User struct {
	Username string `json:"username"`

	MarkedChapters []MarkedChapter `json:"markedChapters"`
	BookmarkedChapters []BookmarkedChapter `json:"bookmarkedChapters"`
}

var importCmd = &cobra.Command{
	Use: "import <IMPORT_FILE>",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		godotenv.Load()

		dbUrl := os.Getenv("DB_URL")
		if dbUrl == "" {
			log.Fatal("DB_URL not set")
		}

		conn, err := pgxpool.New(context.Background(), dbUrl)
		if err != nil {
			log.Fatal(err)
		}

		db := database.New(conn)

		importFile := args[0]
		data, err := os.ReadFile(importFile)
		if err != nil {
			log.Fatal(err)
		}

		var user User
		err = json.Unmarshal(data, &user)
		if err != nil {
			log.Fatal(err)
		}

		ctx := context.Background()

		dbUser, err := db.GetUserByUsername(ctx, user.Username)
		if err != nil {
			log.Fatal(err)
		}

		cachedSeries := make(map[string]string)

		for _, chapter := range user.MarkedChapters {
			serieId, exists := cachedSeries[chapter.SerieTitle]
			if !exists {
				serie, err := db.GetSerieByName(ctx, chapter.SerieTitle)
				if err != nil {
					log.Fatal(err)
				}

				cachedSeries[chapter.SerieTitle] = serie.Id
				serieId = serie.Id
			}

			fmt.Printf("serieId: %v\n", serieId)
			err := db.MarkChapter(ctx, dbUser.Id, serieId, chapter.ChapterNumber, true)
			if err != nil {
				fmt.Printf("Warning: %v\n", err)
			}
		}

		for _, chapter := range user.BookmarkedChapters {
			serieId, exists := cachedSeries[chapter.SerieTitle]
			if !exists {
				serie, err := db.GetSerieByName(ctx, chapter.SerieTitle)
				if err != nil {
					log.Fatal(err)
				}

				cachedSeries[chapter.SerieTitle] = serie.Id
				serieId = serie.Id
			}

			fmt.Printf("serieId: %v\n", serieId)
			err := db.CreateBookmark(ctx, dbUser.Id, serieId, chapter.ChapterNumber, chapter.Page)
			if err != nil {
				log.Fatal(err)
			}
		}
	},
}

func init() {
	rootCmd.AddCommand(testCmd)
	rootCmd.AddCommand(importCmd)
}
