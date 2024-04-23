package handlers

import (
	"errors"
	"fmt"

	"github.com/jackc/pgerrcode"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandlePostUserMarkChapters(c echo.Context) error {
	user, err := api.User(c)
	if err != nil {
		return err
	}

	var body types.ApiPostUserMarkChapters
	err = c.Bind(&body)
	if err != nil {
		return err
	}

	pretty.Println(body)

	serie, err := api.database.GetSerieById(c.Request().Context(), body.SerieId)
	if err != nil {
		return err
	}

	for _, chapter := range body.Chapters {
		err := api.database.MarkChapter(c.Request().Context(), user.Id, serie.Id, chapter, true)
		if err != nil {
			var pgErr *pgconn.PgError
			if errors.As(err, &pgErr) {
				if pgErr.Code == pgerrcode.UniqueViolation {
					continue
				}
			}

			return err
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func (api *ApiConfig) HandlePostUserUnmarkChapters(c echo.Context) error {
	user, err := api.User(c)
	if err != nil {
		return err
	}

	var body types.ApiPostUserUnmarkChapters
	err = c.Bind(&body)
	if err != nil {
		return err
	}

	pretty.Println(body)

	serie, err := api.database.GetSerieById(c.Request().Context(), body.SerieId)
	if err != nil {
		return err
	}

	for _, chapter := range body.Chapters {
		err := api.database.MarkChapter(c.Request().Context(), user.Id, serie.Id, chapter, false)
		if err != nil {
			return err
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func (api *ApiConfig) HandlePostUserUpdateBookmark(c echo.Context) error {
	user, err := api.User(c)
	if err != nil {
		return err
	}

	var body types.ApiPostUserUpdateBookmark
	err = c.Bind(&body)
	if err != nil {
		return err
	}

	ctx := c.Request().Context()

	pretty.Println(body)

	serie, err := api.database.GetSerieById(ctx, body.SerieId)
	if err != nil {
		return err
	}

	chapter, err := api.database.GetChapter(ctx, serie.Id, body.Chapter)
	if err != nil {
		return err
	}

	hasBookmark, _, err := api.database.HasBookmark(ctx, user.Id, serie.Id)
	if err != nil {
		return err
	}

	if hasBookmark {
		err := api.database.UpdateBookmark(ctx, user.Id, serie.Id, chapter.Number)
		if err != nil {
			return err
		}
	} else {
		err := api.database.CreateBookmark(ctx, user.Id, serie.Id, chapter.Number)
		if err != nil {
			return err
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func InstallUserHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/user/markChapters", api.HandlePostUserMarkChapters)
	g.POST("/user/unmarkChapters", api.HandlePostUserUnmarkChapters)
	g.POST("/user/updateBookmark", api.HandlePostUserUpdateBookmark)
}
