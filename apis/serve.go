package apis

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"sort"

	"github.com/kr/pretty"
	"github.com/maruel/natural"
	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle/assets"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
)

func RegisterHandlers(app core.App, router pyrin.Router) {
	g := router.Group("/api/v1")
	InstallHandlers(app, g)

	g.Register(pyrin.ApiHandler{
		Name:        "Testing",
		Method:      http.MethodPost,
		Path:        "/test",
		HandlerFunc: func(c pyrin.Context) (any, error) {
			ctx := context.TODO()

			db := app.DB()

			serie, err := db.GetSerieByName(ctx, "Test Serie")
			if err != nil {
				if errors.Is(err, database.ErrItemNotFound) {
					serie, err = db.CreateSerie(ctx, database.CreateSerieParams{
						Name: "Test Serie",
					})
					if err != nil {
						return nil, err
					}
				} else {
					return nil, err
				}
			}

			n := func(i any) {
				db.CreateChapter(ctx, database.CreateChapterParams{
					SerieSlug: serie.Slug,
					Title:     fmt.Sprintf("Chapter %v", i),
				})
			}

			for i := 0; i < 50; i++ {
				n(i)
			}

			n("14.5")
			n("14.4")
			n("14.494")
			n("2.5")
			n("14.5")
			n("14.5")

			chapters, err := db.GetSerieChaptersById(ctx, serie.Slug)
			if err != nil {
				return nil, err
			}

			pretty.Println(chapters)

			sort.SliceStable(chapters, func(i, j int) bool {
				return natural.Less(chapters[i].Title, chapters[j].Title)
			})

			pretty.Println(chapters)

			return nil, nil
		},
	})

	g = router.Group("/files")
	g.Register(
		pyrin.NormalHandler{
			Method: http.MethodGet,
			Path:   "/images/default/:image",
			HandlerFunc: func(c pyrin.Context) error {
				image := c.Param("image")
				return pyrin.ServeFile(c.Response(), c.Request(), assets.DefaultImagesFS, image)
			},
		},
		pyrin.NormalHandler{
			Method: http.MethodGet,
			Path:   "/chapters/:serieSlug/:chapterSlug/:image",
			HandlerFunc: func(c pyrin.Context) error {
				serieSlug := c.Param("serieSlug")
				chapterSlug := c.Param("chapterSlug")
				image := c.Param("image")

				p := app.WorkDir().SerieDir(serieSlug).ChapterDir(chapterSlug).PagesDir()
				f := os.DirFS(p)

				return pyrin.ServeFile(c.Response(), c.Request(), f, image)
			},
		},
	)
}

func Server(app core.App) (*pyrin.Server, error) {
	s := pyrin.NewServer(&pyrin.ServerConfig{
		LogName: "sewaddle",
		RegisterHandlers: func(router pyrin.Router) {
			RegisterHandlers(app, router)
		},
	})

	return s, nil
}
