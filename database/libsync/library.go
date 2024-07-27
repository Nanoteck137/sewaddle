package libsync

import (
	"context"
	"database/sql"
	"log"
	"os"
	"path"
	"path/filepath"
	"strconv"

	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/library"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

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
	lib, err := library.ReadFromDir(dir)
	if err != nil {
		return nil, err
	}

	var series []Serie

	for _, serie := range lib.Series {
		var chapters []Chapter

		for _, chapter := range serie.Chapters {
			chapterPath := path.Join(serie.Path(), "chapters", strconv.Itoa(chapter.Number))

			pages := make([]string, len(chapter.Pages))
			for i, page := range chapter.Pages {
				pages[i] = path.Join(chapterPath, page)
			}

			chapters = append(chapters, Chapter{
				Path:  chapterPath,
				Title: chapter.Name,
				Index: chapter.Number,
				Pages: pages,
			})
		}

		coverPath := path.Join(serie.Path(), serie.CoverArt)

		series = append(series, Serie{
			Path:      serie.Path(),
			Title:     serie.Title,
			CoverPath: coverPath,
			Chapters:  chapters,
		})
	}

	return &Library{
		Base:   dir,
		Series: series,
	}, nil
}

var dialect = goqu.Dialect("postgres")

func GetOrCreateSerie(ctx context.Context, db *database.Database, serie *Serie) (database.Serie, error) {
	dbSerie, err := db.GetSerieByPath(ctx, serie.Path)
	if err != nil {
		if err == types.ErrNoSerie {
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

func (lib *Library) Sync(db *database.Database, workDir types.WorkDir) {
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

		// TODO(patrik): Check for empty serie.CoverPath

		ext := path.Ext(serie.CoverPath)
		name := dbSerie.Id + ext
		dst := path.Join(imagesDir, name)

		src, err := filepath.Abs(serie.CoverPath)
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
