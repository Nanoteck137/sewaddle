package main

import (
	"archive/zip"
	"context"
	"database/sql"
	"encoding/json"
	"encoding/xml"
	"errors"
	"io"
	"io/fs"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/kr/pretty"
	"github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/sewaddle"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
	"github.com/spf13/cobra"
)

var AppName = sewaddle.AppName + "-import"

var rootCmd = &cobra.Command{
	Use:     AppName,
	Version: sewaddle.Version,
}

type MangaInfoChapter struct {
	Index int      `json:"index"`
	Name  string   `json:"name"`
	Pages []string `json:"pages"`
}

type MangaInfo struct {
	Title    string             `json:"title"`
	Cover    string             `json:"cover"`
	Chapters []MangaInfoChapter `json:"chapters"`
}

func ReadMangaInfo(p string) (MangaInfo, error) {
	d, err := os.ReadFile(p)
	if err != nil {
		return MangaInfo{}, err
	}

	var res MangaInfo
	err = json.Unmarshal(d, &res)
	if err != nil {
		return MangaInfo{}, err
	}

	return res, nil
}

var oldFormatCmd = &cobra.Command{
	Use:  "old-format <INPUT>",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		input := args[0]

		dataDir, exists := os.LookupEnv("SEWADDLE_DATA_DIR")
		if !exists {
			log.Fatal("Need to set 'SEWADDLE_DATA_DIR' env variable")
		}

		workDir := types.WorkDir(dataDir)

		dirs := []string{
			workDir.SeriesDir(),
			workDir.ChaptersDir(),
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

		mangaInfo, err := ReadMangaInfo(path.Join(input, "manga.json"))
		if err != nil {
			log.Fatal("Failed", err)
		}

		pretty.Println(mangaInfo)
		serie, err := db.GetSerieByName(ctx, mangaInfo.Title)
		if err != nil {
			if errors.Is(err, database.ErrItemNotFound) {
				serie, err = db.CreateSerie(ctx, database.CreateSerieParams{
					Name: mangaInfo.Title,
				})
				if err != nil {
					log.Fatal("Failed", "err", err)
				}

				serieDir := workDir.SerieDir(serie.Id)
				dirs := []string{
					serieDir.String(),
					serieDir.ImagesDir(),
				}

				for _, dir := range dirs {
					err := os.Mkdir(dir, 0755)
					if err != nil && !os.IsExist(err) {
						log.Fatal("Failed to create serie directory", "err", err, "serieId", serie.Id)
					}
				}
			} else {
				log.Fatal("Failed", "err", err)
			}
		}

		pretty.Println(serie)

		if mangaInfo.Cover != "" {
			p := path.Join(input, "images", mangaInfo.Cover)

			src, err := os.Open(p)
			if err != nil {
				log.Fatal("Failed to open cover image", "err", err)
			}
			defer src.Close()

			dstDir := workDir.SerieDir(serie.Id).ImagesDir()
			dstPath := path.Join(dstDir, "cover-original"+path.Ext(p))
			dst, err := os.OpenFile(dstPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0644)
			if err != nil {
				log.Fatal("Failed to open cover dst image", "err", err)
			}
			defer dst.Close()

			_, err = io.Copy(dst, src)
			if err != nil {
				log.Fatal("Failed to copy original cover image", "err", err)
			}

			large := path.Join(dstDir, "cover-large.png")
			err = utils.CreateResizedImage(dstPath, large, 360, 480)
			if err != nil {
				log.Fatal("Failed to create large cover image", "err", err)
			}

			medium := path.Join(dstDir, "cover-medium.png")
			err = utils.CreateResizedImage(dstPath, medium, 270, 360)
			if err != nil {
				log.Fatal("Failed to create medium cover image", "err", err)
			}

			small := path.Join(dstDir, "cover-small.png")
			err = utils.CreateResizedImage(dstPath, small, 180, 240)
			if err != nil {
				log.Fatal("Failed to create small cover image", "err", err)
			}

			createChange := func(p string) types.Change[sql.NullString] {
				return types.Change[sql.NullString]{
					Value: sql.NullString{
						String: p,
						Valid:  true,
					},
					Changed: true,
				}
			}

			err = db.UpdateSerie(ctx, serie.Id, database.SerieChanges{
				CoverOriginal: createChange(path.Base(dstPath)),
				CoverLarge:    createChange(path.Base(large)),
				CoverMedium:   createChange(path.Base(medium)),
				CoverSmall:    createChange(path.Base(small)),
			})
			if err != nil {
				log.Fatal("Failed to update serie cover", "err", err)
			}
		}

		for _, c := range mangaInfo.Chapters {
			func() {
				p := path.Join(input, "chapters", strconv.Itoa(c.Index))

				name := strings.TrimSpace(c.Name)

				// TODO(patrik): Validate the whole manga info
				if name == "" {
					log.Fatal("Name can't be empty")
				}

				chapter, err := db.CreateChapter(ctx, database.CreateChapterParams{
					SerieId: serie.Id,
					Title:   c.Name,
				})

				if err != nil {
					pretty.Println(err)
					var sqlErr sqlite3.Error
					if errors.As(err, &sqlErr) {
						if sqlErr.ExtendedCode == sqlite3.ErrConstraintPrimaryKey {
							return
						}
					}

					log.Fatal("Failed to create chapter", "err", err)
				}

				chapterDir := workDir.ChapterDir(chapter.Id)

				err = os.Mkdir(chapterDir, 0755)
				if err != nil && !os.IsExist(err) {
					log.Fatal("Failed to create chapater directory", "err", err, "chapterId", chapter.Id)
				}

				var names []string
				for i, page := range c.Pages {
					p := path.Join(p, page)
					r, err := os.Open(p)
					if err != nil {
						log.Fatal("Failed to open page file for reading", "err", err)
					}

					dstName := strconv.Itoa(i) + path.Ext(p)
					d := path.Join(chapterDir, dstName)
					dst, err := os.OpenFile(d, os.O_WRONLY|os.O_CREATE, 0644)
					if err != nil {
						log.Fatal("Failed to open page file for writing", "err", err)
					}
					defer dst.Close()

					_, err = io.Copy(dst, r)
					if err != nil {
						log.Fatal("Failed to copy page content to file", "err", err)
					}

					names = append(names, dstName)
				}

				chapterCover := path.Join(p, c.Pages[0])
				chapterCoverDst := path.Join(chapterDir, "cover.png")
				err = utils.CreateResizedImage(chapterCover, chapterCoverDst, 80, 112)
				if err != nil {
					log.Fatal("Failed to create chapter cover", "err", err)
				}

				err = db.UpdateChapter(ctx, chapter.Id, database.ChapterChanges{
					Pages: types.Change[string]{
						Value:   strings.Join(names, ","),
						Changed: true,
					},
					Cover: types.Change[sql.NullString]{
						Value: sql.NullString{
							String: path.Base(chapterCoverDst),
							Valid:  true,
						},
						Changed: true,
					},
				})

				if err != nil {
					log.Fatal("Failed to update chapter", "err", err)
				}
			}()
		}

		err = db.RecalculateNumberForSerie(ctx, serie.Id)
		if err != nil {
			log.Fatal("Failed", err)
		}
	},
}

type ComicInfo struct {
	Title  string
	Series string
	Manga  string
}

func importCbz(ctx context.Context, db *database.Database, workDir types.WorkDir, serieId string, p string) error {
	z, err := zip.OpenReader(p)
	if err != nil {
		return err
	}

	var comicInfo *zip.File
	var pages []*zip.File

	for _, f := range z.File {
		if f.Name == "ComicInfo.xml" {
			comicInfo = f
			continue
		}

		switch path.Ext(f.Name) {
		case ".png", ".jpeg", ".jpg":
			pages = append(pages, f)
		default:
			log.Warn("Unknown file extention", "file", f.Name)
		}
	}

	name := strings.TrimSuffix(path.Base(p), path.Ext(p))

	if comicInfo != nil {
		r, err := comicInfo.Open()
		if err != nil {
			return err
		}
		defer r.Close()

		var comicInfo ComicInfo

		d := xml.NewDecoder(r)
		err = d.Decode(&comicInfo)
		if err != nil {
			return err
		}

		n := strings.TrimSpace(comicInfo.Title)
		if n != "" {
			name = n
		}
	}

	chapter, err := db.CreateChapter(ctx, database.CreateChapterParams{
		SerieId: serieId,
		Title:   name,
	})

	if err != nil {
		return err
	}

	chapterDir := workDir.ChapterDir(chapter.Id)

	err = os.Mkdir(chapterDir, 0755)
	if err != nil && !os.IsExist(err) {
		return err
	}

	copyZipToFs := func(f *zip.File, dst string) error {
		df, err := os.OpenFile(dst, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
		if err != nil {
			return err
		}
		defer df.Close()

		src, err := f.Open()
		if err != nil {
			return err
		}
		defer src.Close()

		_, err = io.Copy(df, src)
		if err != nil {
			return err
		}

		return nil
	}

	var names []string
	for i, page := range pages {
		pageName := strconv.Itoa(i) + path.Ext(page.Name)
		dst := path.Join(chapterDir, pageName)
		copyZipToFs(page, dst)

		names = append(names, pageName)
	}

	dname, err := os.MkdirTemp("", "sewaddle")
	if err != nil {
		return err
	}
	defer os.RemoveAll(dname)

	f := pages[0]
	dst := path.Join(dname, f.Name)
	err = copyZipToFs(f, dst)
	if err != nil {
		return err
	}

	chapterCoverDst := path.Join(chapterDir, "cover.png")
	err = utils.CreateResizedImage(dst, chapterCoverDst, 80, 112)
	if err != nil {
		return err
	}

	err = db.UpdateChapter(ctx, chapter.Id, database.ChapterChanges{
		Pages: types.Change[string]{
			Value:   strings.Join(names, ","),
			Changed: true,
		},
		Cover: types.Change[sql.NullString]{
			Value: sql.NullString{
				String: path.Base(chapterCoverDst),
				Valid:  true,
			},
			Changed: true,
		},
	})

	if err != nil {
		return err
	}

	return nil
}

var cbzCmd = &cobra.Command{
	Use:  "cbz <SERIE_ID>",
	Args: cobra.ExactArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		serieId := args[0]
		dir, _ := cmd.Flags().GetString("dir")

		dataDir, exists := os.LookupEnv("SEWADDLE_DATA_DIR")
		if !exists {
			log.Fatal("Need to set 'SEWADDLE_DATA_DIR' env variable")
		}

		workDir := types.WorkDir(dataDir)

		dirs := []string{
			workDir.SeriesDir(),
			workDir.ChaptersDir(),
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

		_, err = db.GetSerieById(ctx, serieId)
		if err != nil {
			log.Fatal("Failed", "err", err)
		}

		var files []string

		filepath.Walk(dir, func(p string, info fs.FileInfo, err error) error {
			switch path.Ext(info.Name()) {
			case ".cbz":
				files = append(files, p)
			}

			return nil
		})

		pretty.Println(files)

		for _, p := range files {
			err := importCbz(ctx, db, workDir, serieId, p)
			if err != nil {
				log.Fatal("Failed to import cbz", "err", err)
			}
		}

		err = db.RecalculateNumberForSerie(ctx, serieId)
		if err != nil {
			log.Fatal("Failed to recalculate numbers for serie", "err", err)
		}
	},
}

func init() {
	rootCmd.SetVersionTemplate(sewaddle.VersionTemplate(AppName))

	cbzCmd.Flags().StringP("dir", "d", ".", "Directory to search for cbz files")

	rootCmd.AddCommand(oldFormatCmd)
	rootCmd.AddCommand(cbzCmd)
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatal("Failed to run root command", "err", err)
	}
}

func main() {
	Execute()
}
