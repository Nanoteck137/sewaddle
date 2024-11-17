package cli

import (
	"github.com/spf13/cobra"
)

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

	MarkedChapters     []MarkedChapter     `json:"markedChapters"`
	BookmarkedChapters []BookmarkedChapter `json:"bookmarkedChapters"`
}

var importCmd = &cobra.Command{
	Use:  "import <IMPORT_FILE>",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		// app := core.NewBaseApp(&config.LoadedConfig)
		//
		// err := app.Bootstrap()
		// if err != nil {
		// 	log.Fatal("Failed to bootstrap app", "err", err)
		// }
		//
		// // TODO(patrik): Maybe create a flag to run this on startup
		// // TODO(patrik): Move to apis.Server
		// err = runMigrateUp(app.DB())
		// if err != nil {
		// 	log.Fatal("Failed to run migrate up", "err", err)
		// }
		//
		// importFile := args[0]
		// data, err := os.ReadFile(importFile)
		// if err != nil {
		// 	log.Fatal(err)
		// }
		//
		// var user User
		// err = json.Unmarshal(data, &user)
		// if err != nil {
		// 	log.Fatal(err)
		// }
		//
		// ctx := context.Background()
		//
		// dbUser, err := app.DB().GetUserByUsername(ctx, user.Username)
		// if err != nil {
		// 	log.Fatal(err)
		// }
		//
		// cachedSeries := make(map[string]string)
		//
		// for _, chapter := range user.MarkedChapters {
		// 	serieId, exists := cachedSeries[chapter.SerieTitle]
		// 	if !exists {
		// 		serie, err := app.DB().GetSerieByName(ctx, chapter.SerieTitle)
		// 		if err != nil {
		// 			log.Fatal(err)
		// 		}
		//
		// 		cachedSeries[chapter.SerieTitle] = serie.Id
		// 		serieId = serie.Id
		// 	}
		//
		// 	fmt.Printf("serieId: %v\n", serieId)
		// 	err := app.DB().MarkChapter(ctx, dbUser.Id, serieId, chapter.ChapterNumber)
		// 	if err != nil {
		// 		fmt.Printf("Warning: %v\n", err)
		// 	}
		// }
		//
		// for _, chapter := range user.BookmarkedChapters {
		// 	serieId, exists := cachedSeries[chapter.SerieTitle]
		// 	if !exists {
		// 		serie, err := app.DB().GetSerieByName(ctx, chapter.SerieTitle)
		// 		if err != nil {
		// 			log.Fatal(err)
		// 		}
		//
		// 		cachedSeries[chapter.SerieTitle] = serie.Id
		// 		serieId = serie.Id
		// 	}
		//
		// 	fmt.Printf("serieId: %v\n", serieId)
		// 	err := app.DB().CreateBookmark(ctx, dbUser.Id, serieId, chapter.ChapterNumber, chapter.Page)
		// 	if err != nil {
		// 		fmt.Printf("Warning: %v", err)
		// 	}
		// }
	},
}

func init() {
	rootCmd.AddCommand(importCmd)
}
