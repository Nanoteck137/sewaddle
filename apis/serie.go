package apis

import (
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	pyrinapi "github.com/nanoteck137/pyrin/api"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

type serieApi struct {
	app core.App
}

func (api *serieApi) HandleGetSeries(c echo.Context) error {
	items, err := api.app.DB().GetAllSeries(c.Request().Context())
	if err != nil {
		return err
	}

	result := types.GetSeries{
		Series: make([]types.Serie, len(items)),
	}

	for i, item := range items {
		cover := "/images/default/default_cover.png"
		if item.Cover.Valid {
			cover = "/images/" + item.Cover.String
		}

		result.Series[i] = types.Serie{
			Slug:         item.Slug,
			Name:         item.Name,
			Cover:        utils.ConvertURL(c, cover),
			ChapterCount: item.ChapterCount,
		}
	}

	return c.JSON(200, pyrinapi.SuccessResponse(result))
}

func (api *serieApi) HandleGetSerieBySlug(c echo.Context) error {
	id := c.Param("slug")
	serie, err := api.app.DB().GetSerieById(c.Request().Context(), id)
	if err != nil {
		if errors.Is(err, database.ErrItemNotFound) {
			return SerieNotFound()
		}

		return err
	}

	var userData *types.SerieUserData

	user, err := User(api.app, c)
	if user != nil {

		dbBookmark, err := api.app.DB().GetBookmark(c.Request().Context(), user.Id, serie.Slug)
		if err != nil && err != database.ErrItemNotFound {
			return err
		}

		var bookmark *types.Bookmark
		if err != database.ErrItemNotFound {
			bookmark = &types.Bookmark{
				ChapterSlug: dbBookmark.ChapterSlug,
			}
		}

		userData = &types.SerieUserData{
			Bookmark: bookmark,
		}
	}

	cover := "/images/default/default_cover.png"
	if serie.Cover.Valid {
		cover = "/images/" + serie.Cover.String
	}

	result := types.GetSerieById{
		Serie: types.Serie{
			Slug:         serie.Slug,
			Name:         serie.Name,
			Cover:        utils.ConvertURL(c, cover),
			ChapterCount: serie.ChapterCount,
		},
		User: userData,
	}

	return c.JSON(200, pyrinapi.SuccessResponse(result))
}

func (api *serieApi) HandleGetSerieChaptersBySlug(c echo.Context) error {
	id := c.Param("slug")

	items, err := api.app.DB().GetSerieChaptersById(c.Request().Context(), id)
	if err != nil {
		return err
	}

	result := types.GetSerieChaptersById{
		Chapters: make([]types.Chapter, len(items)),
	}

	var markedChapters []string

	user, _ := User(api.app, c)
	if user != nil {
		markedChapters, err = api.app.DB().GetAllMarkedChapters(c.Request().Context(), user.Id, id)
		if err != nil {
			return err
		}
	}

	isChapterMarked := func(chapterSlug string) bool {
		if markedChapters == nil {
			return false
		}

		for _, item := range markedChapters {
			if item == chapterSlug {
				return true
			}
		}

		return false
	}

	for i, item := range items {
		pages := strings.Split(item.Pages, ",")
		coverArt := utils.ConvertURL(c, fmt.Sprintf("/chapters/%s/%s/%s", item.SerieSlug, item.Slug, pages[0]))

		var userData *types.ChapterUserData
		if user != nil {
			isMarked := isChapterMarked(item.Slug)

			userData = &types.ChapterUserData{
				IsMarked: isMarked,
			}
		}

		result.Chapters[i] = types.Chapter{
			SerieSlug: item.SerieSlug,
			Slug:      item.Slug,
			Title:     item.Title,
			CoverArt:  coverArt,
			User:      userData,
		}
	}

	return c.JSON(200, pyrinapi.SuccessResponse(result))
}

func InstallSerieHandlers(app core.App, group Group) {
	api := serieApi{app: app}

	requireSetup := RequireSetup(app)

	group.Register(
		Handler{
			Name:        "GetSeries",
			Method:      http.MethodGet,
			Path:        "/series",
			DataType:    types.GetSeries{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetSeries,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},

		Handler{
			Name:        "GetSerieById",
			Method:      http.MethodGet,
			Path:        "/series/:slug",
			DataType:    types.GetSerieById{},
			BodyType:    nil,
			Errors:      []pyrinapi.ErrorType{TypeSerieNotFound},
			HandlerFunc: api.HandleGetSerieBySlug,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},

		Handler{
			Name:        "GetSerieChapters",
			Method:      http.MethodGet,
			Path:        "/series/:slug/chapters",
			DataType:    types.GetSerieChaptersById{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetSerieChaptersBySlug,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},
	)
}
