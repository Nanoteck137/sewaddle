package apis

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	pyrinapi "github.com/nanoteck137/pyrin/api"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
)

type userApi struct {
	app core.App
}

func (api *userApi) HandlePostUserMarkChapters(c echo.Context) error {
	user, err := User(api.app, c)
	if err != nil {
		return err
	}

	body, err := Body[types.PostUserMarkChaptersBody](c)
	if err != nil {
		return err
	}

	serie, err := api.app.DB().GetSerieById(c.Request().Context(), body.SerieSlug)
	if err != nil {
		return err
	}

	for _, chapter := range body.Chapters {
		err := api.app.DB().MarkChapter(c.Request().Context(), user.Id, serie.Slug, chapter)
		if err != nil && !errors.Is(err, database.ErrAlreadyMarked) {
			return err
		}
	}

	return c.JSON(200, pyrinapi.SuccessResponse(nil))
}

func (api *userApi) HandlePostUserUnmarkChapters(c echo.Context) error {
	user, err := User(api.app, c)
	if err != nil {
		return err
	}

	body, err := Body[types.PostUserUnmarkChaptersBody](c)
	if err != nil {
		return err
	}

	serie, err := api.app.DB().GetSerieById(c.Request().Context(), body.SerieSlug)
	if err != nil {
		return err
	}

	for _, chapter := range body.Chapters {
		err := api.app.DB().UnmarkChapter(c.Request().Context(), user.Id, serie.Slug, chapter)
		if err != nil {
			return err
		}
	}

	return c.JSON(200, pyrinapi.SuccessResponse(nil))
}

func (api *userApi) HandlePostUserUpdateBookmark(c echo.Context) error {
	user, err := User(api.app, c)
	if err != nil {
		return err
	}

	body, err := Body[types.PostUserUpdateBookmarkBody](c)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()

	// TODO(patrik): Check body.Page

	serie, err := api.app.DB().GetSerieById(ctx, body.SerieSlug)
	if err != nil {
		return err
	}

	chapter, err := api.app.DB().GetChapter(ctx, serie.Slug, body.ChapterSlug)
	if err != nil {
		return err
	}

	hasBookmark, err := api.app.DB().HasBookmark(ctx, user.Id, serie.Slug)
	if err != nil {
		return err
	}

	if hasBookmark {
		err := api.app.DB().UpdateBookmark(ctx, user.Id, serie.Slug, chapter.Slug, body.Page)
		if err != nil {
			return err
		}
	} else {
		err := api.app.DB().CreateBookmark(ctx, user.Id, serie.Slug, chapter.Slug, body.Page)
		if err != nil {
			return err
		}
	}

	return c.JSON(200, pyrinapi.SuccessResponse(nil))
}

func InstallUserHandlers(app core.App, group Group) {
	api := userApi{app: app}

	requireSetup := RequireSetup(app)

	group.Register(
		Handler{
			Name:        "MarkChapters",
			Method:      http.MethodPost,
			Path:        "/user/markChapters",
			DataType:    nil,
			BodyType:    types.PostUserMarkChaptersBody{},
			HandlerFunc: api.HandlePostUserMarkChapters,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},

		Handler{
			Name:        "UnmarkChapters",
			Method:      http.MethodPost,
			Path:        "/user/unmarkChapters",
			DataType:    nil,
			BodyType:    types.PostUserUnmarkChaptersBody{},
			HandlerFunc: api.HandlePostUserUnmarkChapters,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},

		Handler{
			Name:        "UpdateBookmark",
			Method:      http.MethodPost,
			Path:        "/user/updateBookmark",
			DataType:    nil,
			BodyType:    types.PostUserUpdateBookmarkBody{},
			HandlerFunc: api.HandlePostUserUpdateBookmark,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},
	)
}
