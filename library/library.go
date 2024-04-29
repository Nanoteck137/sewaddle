package library

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

type ChapterMetadata struct {
	Index int      `json:"index"`
	Name  string   `json:"name"`
	Pages []string `json:"pages"`
}

type SerieMetadata struct {
	Title    string            `json:"title"`
	Cover    string            `json:"cover"`
	Chapters []ChapterMetadata `json:"chapters"`
}

type Chapter struct {
	Path  string
	Title string
	Index int

	Pages []string
}

type Serie struct {
	Path      string
	Title     string
	CoverPath string
	Chapters  []Chapter
}

type Library struct {
	Base   string
	Series []Serie
}

func ReadFromDir(dir string) (*Library, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var series []Serie

	for _, entry := range entries {
		// Skip over files and folders starting with a dot
		if entry.Name()[0] == '.' {
			continue
		}

		p := path.Join(dir, entry.Name())

		data, err := os.ReadFile(path.Join(p, "manga.json"))
		if err != nil {
			log.Printf("Warning: '%v' has no manga.json", p)
			return nil, err
		}

		var metadata SerieMetadata
		err = json.Unmarshal(data, &metadata)
		if err != nil {
			return nil, err
		}

		coverPath := path.Join(entry.Name(), "images", metadata.Cover)
		fmt.Printf("coverPath: %v\n", coverPath)

		var chapters []Chapter

		for _, chapter := range metadata.Chapters {
			chapterPath := path.Join(p, "chapters", strconv.Itoa(chapter.Index))

			pages := make([]string, len(chapter.Pages))
			for i, page := range chapter.Pages {
				pages[i] = path.Join(chapterPath, page)
			}

			chapters = append(chapters, Chapter{
				Path:  chapterPath,
				Title: chapter.Name,
				Index: chapter.Index,
				Pages: pages,
			})
		}

		// pretty.Println(metadata)
		series = append(series, Serie{
			Path:      p,
			Title:     metadata.Title,
			CoverPath: coverPath,
			Chapters:  chapters,
		})
	}

	// pretty.Println(series)

	return &Library{
		Base:   dir,
		Series: series,
	}, nil
}

var dialect = goqu.Dialect("postgres")

func GetOrCreateSerie(ctx context.Context, db *database.Database, serie *Serie) (database.Serie, error) {
	dbSerie, err := db.GetSerieByPath(ctx, serie.Path)
	if err != nil {
		if err == sql.ErrNoRows {
			dbSerie, err := db.CreateSerie(ctx, serie.Title, serie.Path)
			if err != nil {
				return database.Serie{}, err
			}

			return dbSerie, nil
		} else {
			return database.Serie{}, err
		}
	}

	return dbSerie, nil
}

func GetOrCreateChapter(ctx context.Context, db *database.Database, chapter *Chapter, serie *database.Serie) (database.Chapter, error) {
	dbChapter, err := db.GetChapterByPath(ctx, chapter.Path)
	if err != nil {
		if err == sql.ErrNoRows {
			dbChapter, err := db.CreateChapter(ctx, chapter.Index, chapter.Title, serie.Id, chapter.Path)
			if err != nil {
				return database.Chapter{}, err
			}

			return dbChapter, nil
		} else {
			return database.Chapter{}, err
		}
	}

	return dbChapter, nil
}

func (lib *Library) Sync(conn *sql.DB, workDir types.WorkDir) {
	db := database.New(conn)
	ctx := context.Background()

	imagesDir := workDir.ImagesDir()
	err := os.MkdirAll(imagesDir, 0755)
	if err != nil {
		// TODO(patrik): Remove
		log.Fatal(err)
	}

	chaptersDir := workDir.ChaptersDir()
	err = os.MkdirAll(chaptersDir, 0755)
	if err != nil {
		// TODO(patrik): Remove
		log.Fatal(err)
	}

	for _, serie := range lib.Series {
		dbSerie, err := GetOrCreateSerie(ctx, db, &serie)
		if err != nil {
			log.Println("Err:", err)
			continue
		}

		ext := path.Ext(serie.CoverPath)
		name := dbSerie.Id + ext
		dst := path.Join(imagesDir, name)

		src, err := filepath.Abs(path.Join(lib.Base, serie.CoverPath))
		if err != nil {
			// TODO(patrik): Remove
			log.Fatal(err)
		}

		err = utils.SymlinkReplace(src, dst)
		if err != nil {
			log.Fatal(err)
		}

		err = db.UpdateSerieCover(ctx, dbSerie.Id, name)
		if err != nil {
			log.Fatal(err)
		}

		for _, chapter := range serie.Chapters {
			dbChapter, err := GetOrCreateChapter(ctx, db, &chapter, &dbSerie)
			if err != nil {
				log.Println("Err:", err)
				continue
			}

			dir := path.Join(chaptersDir, dbChapter.SerieId, strconv.Itoa(dbChapter.Number))

			err = os.MkdirAll(dir, 0755)
			if err != nil {
				// TODO(patrik): Remove
				log.Fatal(err)
			}

			var pages []string
			for _, page := range chapter.Pages {
				name := path.Base(page)
				dst := path.Join(dir, name)

				src, err := filepath.Abs(page)
				if err != nil {
					// TODO(patrik): Remove
					log.Fatal(err)
				}

				err = utils.SymlinkReplace(src, dst)
				if err != nil {
					log.Fatal(err)
				}

				pages = append(pages, name)
			}

			db.UpdateChapterPages(ctx, dbChapter.SerieId, dbChapter.Number, pages)
		}
	}
}
