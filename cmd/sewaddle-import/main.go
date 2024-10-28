package main

import (
	"archive/zip"
	"context"
	"database/sql"
	"encoding/xml"
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path"
	"path/filepath"

	"github.com/kr/pretty"
	"github.com/nanoteck137/sewaddle"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/spf13/cobra"
)

var AppName = sewaddle.AppName + "-import"

var rootCmd = &cobra.Command{
	Use:     AppName + " <OUT>",
	Version: sewaddle.Version,
	Args:    cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		out := args[0]
		dir, _ := cmd.Flags().GetString("dir")

		workDir := types.WorkDir(out)

		err := os.MkdirAll(workDir.ImagesDir(), 0755)
		if err != nil {
			log.Fatal("Failed to create images dir", "err", err)
		}

		err = os.MkdirAll(workDir.ChaptersDir(), 0755)
		if err != nil {
			log.Fatal("Failed to create chapters dir", "err", err)
		}

		db, err := database.Open(workDir)
		if err != nil {
			log.Fatal("Failed to open database", "err", err)
		}

		err = db.RunMigrateUp()
		if err != nil {
			log.Fatal("Failed migrate database", "err", err)
		}

		ctx := context.TODO()

		var chapters []string

		filepath.Walk(dir, func(p string, info fs.FileInfo, err error) error {
			name := info.Name()
			ext := path.Ext(name)

			fmt.Printf("name: %v\n", name)
			fmt.Printf("ext: %v\n", ext)

			if ext == ".cbz" {
				fmt.Printf("p: %v\n", p)
				chapters = append(chapters, p)
			}

			return nil
		})

		fmt.Printf("chapters: %v\n", chapters)

		for _, p := range chapters {
			r, err := zip.OpenReader(p)
			if err != nil {
				log.Fatal("Failed to open chapter", "err", err)
			}
			defer r.Close()

			type ComicInfo struct {
				Title  string
				Series string
				Number int64
			}

			var data ComicInfo
			foundInfo := false
			var pages []int

			for i, f := range r.File {
				fmt.Printf("f.Name: %v\n", f.Name)

				ext := path.Ext(f.Name)

				switch ext {
				case ".jpeg", ".jpg", ".png":
					pages = append(pages, i)
				}

				if f.Name == "ComicInfo.xml" {
					r, err := f.Open()
					if err != nil {
						log.Fatal("Failed to open comic info", "err", err, "chapter", p)
					}
					defer r.Close()

					d := xml.NewDecoder(r)

					err = d.Decode(&data)
					if err != nil {
						log.Fatal("Failed to unmarshal comic info", "err", err, "chapter", p)
					}

					pretty.Println(data)

					foundInfo = true
				}
			}

			if !foundInfo {
				fmt.Printf("Skipping %v because no ComicInfo.xml found", p)
				continue
			}

			fmt.Printf("pages: %v\n", pages)

			serie, err := db.GetSerieByName(ctx, data.Series)
			fmt.Printf("err: %v\n", err)
			if err != nil {
				if errors.Is(err, database.ErrItemNotFound) {
					serie, err = db.CreateSerie(ctx, database.CreateSerieParams{
						Name:    data.Series,
					})

					if err != nil {
						log.Fatal("Failed", "err", err)
					}
				} else {
					log.Fatal("Failed", "err", err)
				}
			}

			fmt.Printf("serie: %v\n", serie)

			_, err = db.CreateChapter(ctx, database.CreateChapterParams{
				SerieSlug: serie.Slug,
				Title:     data.Title,
				Number: sql.NullInt64{
					Int64: data.Number,
					Valid: data.Number != 0,
				},
			})

			if err != nil {
				log.Fatal("Failed to create chapter", "err", err)
			}
		}
	},
}

func init() {
	rootCmd.SetVersionTemplate(sewaddle.VersionTemplate(AppName))
	rootCmd.Flags().String("dir", ".", "Search directory")
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatal("Failed to run root command", "err", err)
	}
}

func main() {
	Execute()
}
