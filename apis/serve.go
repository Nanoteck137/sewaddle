package apis

import (
	"net/http"
	"os"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle"
	"github.com/nanoteck137/sewaddle/assets"
	"github.com/nanoteck137/sewaddle/core"
)

func RegisterHandlers(app core.App, router pyrin.Router) {
	g := router.Group("/api/v1")
	InstallHandlers(app, g)

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
			Path:   "/series/:slug/:image",
			HandlerFunc: func(c pyrin.Context) error {
				slug := c.Param("slug")
				image := c.Param("image")

				p := app.WorkDir().SerieDir(slug).ImagesDir()
				f := os.DirFS(p)

				return pyrin.ServeFile(c.Response(), c.Request(), f, image)
			},
		},

		pyrin.NormalHandler{
			Method: http.MethodGet,
			Path:   "/chapters/:serieSlug/:chapterSlug/:image",
			HandlerFunc: func(c pyrin.Context) error {
				serieSlug := c.Param("serieSlug")
				chapterSlug := c.Param("chapterSlug")
				image := c.Param("image")

				p := app.WorkDir().SerieDir(serieSlug).ChapterDir(chapterSlug)
				f := os.DirFS(p)

				return pyrin.ServeFile(c.Response(), c.Request(), f, image)
			},
		},
	)
}

func Server(app core.App) (*pyrin.Server, error) {
	s := pyrin.NewServer(&pyrin.ServerConfig{
		LogName: sewaddle.AppName,
		RegisterHandlers: func(router pyrin.Router) {
			RegisterHandlers(app, router)
		},
	})

	return s, nil
}
