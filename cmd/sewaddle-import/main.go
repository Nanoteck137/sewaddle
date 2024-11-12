package main

import (
	"archive/zip"
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/kr/pretty"
	"github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/packer/metadata"
	"github.com/nanoteck137/sewaddle"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
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

		dirs := []string{
			workDir.SeriesDir(),
		}

		for _, dir := range dirs {
			err := os.Mkdir(dir, 0755)
			if err != nil && !os.IsExist(err) {
				log.Fatal("Failed to create directory", "err", err)
			}
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

		var series []string
		var chapters []string

		filepath.Walk(dir, func(p string, info fs.FileInfo, err error) error {
			name := info.Name()
			ext := path.Ext(name)

			switch ext {
			case ".sw":
				chapters = append(chapters, p)
			case ".sws":
				series = append(series, p)
			}

			return nil
		})

		fmt.Printf("chapters: %v\n", chapters)
		fmt.Printf("series: %v\n", series)

		affectedSeries := make(map[string]struct{})

		for _, p := range series {
			r, err := zip.OpenReader(p)
			if err != nil {
				log.Fatal("Failed to open series", "err", err)
			}
			defer r.Close()

			files := make(map[string]*zip.File)

			for _, f := range r.File {
				files[f.Name] = f
				fmt.Printf("f.Name: %v\n", f.Name)
			}

			infoFile, exists := files["info.json"]
			if !exists {
				log.Fatal("Missing info.json")
			}

			infoReader, err := infoFile.Open()
			if err != nil {
				log.Fatal("Failed", "err", err)
			}
			defer infoReader.Close()

			var info metadata.SeriesInfo

			decoder := json.NewDecoder(infoReader)
			err = decoder.Decode(&info)
			if err != nil {
				log.Fatal("Failed", "err", err)
			}

			pretty.Println(info)

			serie, err := db.GetSerieByName(ctx, info.Name)
			if err != nil {
				if errors.Is(err, database.ErrItemNotFound) {
					serie, err = db.CreateSerie(ctx, database.CreateSerieParams{
						Name: info.Name,
					})
					if err != nil {
						log.Fatal("Failed", "err", err)
					}

					serieDir := workDir.SerieDir(serie.Slug)
					dirs := []string{
						serieDir.String(),
						serieDir.ChaptersDir(),
						serieDir.ImagesDir(),
					}

					for _, dir := range dirs {
						err := os.Mkdir(dir, 0755)
						if err != nil && !os.IsExist(err) {
							log.Fatal("Failed to create serie directory", "err", err, "serieSlug", serie.Slug)
						}
					}
				} else {
					log.Fatal("Failed", "err", err)
				}
			}

			serieDir := workDir.SerieDir(serie.Slug)

			{
				f := files[info.Cover.Small]
				r, err := f.Open()
				if err != nil {
					log.Fatal("Failed", "err", err)
				}
				defer r.Close()


				dst, err := os.Create(path.Join(serieDir.ImagesDir(), "cover-small.png"))
				if err != nil {
					log.Fatal("Failed", "err", err)
				}
				defer dst.Close()

				_, err = io.Copy(dst, r)
				if err != nil {
					log.Fatal("Failed", "err", err)
				}
			}

			err = db.UpdateSerie(ctx, serie.Slug, database.SerieChanges{
				Cover: types.Change[sql.NullString]{
					Value: sql.NullString{
						String: "cover-small.png",
						Valid:  true,
					},
					Changed: true,
				},
			})
			if err != nil {
				log.Fatal("Failed", "err", err)
			}

			pretty.Print(serie)
		}

		for _, p := range chapters {
			r, err := zip.OpenReader(p)
			if err != nil {
				log.Fatal("Failed to open chapter", "err", err)
			}
			defer r.Close()

			files := make(map[string]*zip.File)

			for _, f := range r.File {
				files[f.Name] = f
				fmt.Printf("f.Name: %v\n", f.Name)
			}

			infoFile, exists := files["info.json"]
			if !exists {
				log.Fatal("Missing info.json")
			}

			infoReader, err := infoFile.Open()
			if err != nil {
				log.Fatal("Failed", "err", err)
			}
			defer infoReader.Close()

			var info metadata.EntryInfo

			decoder := json.NewDecoder(infoReader)
			err = decoder.Decode(&info)
			if err != nil {
				log.Fatal("Failed", "err", err)
			}

			serie, err := db.GetSerieByName(ctx, info.Series)
			fmt.Printf("err: %v\n", err)
			if err != nil {
				if errors.Is(err, database.ErrItemNotFound) {
					serie, err = db.CreateSerie(ctx, database.CreateSerieParams{
						Name: info.Series,
					})

					if err != nil {
						log.Fatal("Failed", "err", err)
					}

					serieDir := workDir.SerieDir(serie.Slug)
					dirs := []string{
						serieDir.String(),
						serieDir.ChaptersDir(),
						serieDir.ImagesDir(),
					}

					for _, dir := range dirs {
						err := os.Mkdir(dir, 0755)
						if err != nil && !os.IsExist(err) {
							log.Fatal("Failed to create serie directory", "err", err, "serieSlug", serie.Slug)
						}
					}
				} else {
					log.Fatal("Failed", "err", err)
				}
			}

			fmt.Printf("serie: %v\n", serie)

			chapter, err := db.CreateChapter(ctx, database.CreateChapterParams{
				SerieSlug: serie.Slug,
				Title:     info.Name,
				// Number: sql.NullInt64{
				// 	Int64: data.Number,
				// 	Valid: data.Number != 0,
				// },
			})

			if err != nil {
				pretty.Println(err)
				var sqlErr sqlite3.Error
				if errors.As(err, &sqlErr) {
					// TODO(patrik): Let chapters re-import 
					if sqlErr.ExtendedCode == sqlite3.ErrConstraintPrimaryKey {
						continue
					}
				}

				log.Fatal("Failed to create chapter", "err", err)
			}

			serieDir := workDir.SerieDir(serie.Slug)
			chapterDir := serieDir.ChapterDir(chapter.Slug)

			err = os.Mkdir(chapterDir, 0755)
			if err != nil && !os.IsExist(err) {
				log.Fatal("Failed to create chapater directory", "err", err, "serieSlug", serie.Slug, "chapterSlug", chapter.Slug)
			}

			var names []string

			for _, p := range info.Pages {
				file, exists := files[p]
				if !exists {
					log.Fatal("Page not found")
				}

				r, err := file.Open()
				if err != nil {
					log.Fatal("Failed to open page file", "err", err)
				}
				defer r.Close()

				n := utils.ExtractNumber(file.Name)
				dstName := strconv.Itoa(n) + path.Ext(file.Name)
				d := path.Join(chapterDir, dstName)
				dst, err := os.OpenFile(d, os.O_RDWR|os.O_CREATE, 0644)
				if err != nil {
					log.Fatal("Failed to open file for page", "err", err)
				}
				defer dst.Close()

				_, err = io.Copy(dst, r)
				if err != nil {
					log.Fatal("Failed to copy page content to file", "err", err)
				}

				names = append(names, dstName)
			}

			err = db.UpdateChapter(ctx, serie.Slug, chapter.Slug, database.ChapterChanges{
				Pages: types.Change[string]{
					Value:   strings.Join(names, ","),
					Changed: true,
				},
			})

			if err != nil {
				log.Fatal("Failed to update chapter", "err", err)
			}

			affectedSeries[serie.Slug] = struct{}{}
		}

		for k := range affectedSeries {
			err := db.RecalculateNumberForSerie(ctx, k)
			if err != nil {
				log.Fatal("Failed", "err", err)
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
