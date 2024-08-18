package apis

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/core"
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
		result.Series[i] = types.Serie{
			Id:           item.Id,
			Name:         item.Name,
			Cover:        utils.ConvertURL(c, "/images/"+item.Cover),
			ChapterCount: item.ChapterCount,
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

func (api *serieApi) HandleGetSerieById(c echo.Context) error {
	id := c.Param("id")
	serie, err := api.app.DB().GetSerieById(c.Request().Context(), id)
	if err != nil {
		return err
	}

	var userData *types.SerieUserData

	user, err := User(api.app, c)
	if user != nil {
		var bookmark *types.Bookmark

		dbBookmark, err := api.app.DB().GetBookmark(c.Request().Context(), user.Id, serie.Id)
		if err != nil && err != types.ErrNoBookmark {
			return err
		}

		if err != types.ErrNoBookmark {
			bookmark = &types.Bookmark{
				ChapterSlug: dbBookmark.ChapterSlug,
				Page:        dbBookmark.Page,
			}
		}

		userData = &types.SerieUserData{
			Bookmark: bookmark,
		}
	}

	result := types.GetSerieById{
		Serie: types.Serie{
			Id:           serie.Id,
			Name:         serie.Name,
			Cover:        utils.ConvertURL(c, "/images/"+serie.Cover),
			ChapterCount: serie.ChapterCount,
		},
		User: userData,
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

func (api *serieApi) HandleGetSerieChaptersById(c echo.Context) error {
	id := c.Param("id")

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
		coverArt := utils.ConvertURL(c, fmt.Sprintf("/chapters/%s/%s/%s", item.SerieId, item.Slug, pages[0]))

		var userData *types.ChapterUserData
		if user != nil {
			isMarked := isChapterMarked(item.Slug)

			userData = &types.ChapterUserData{
				IsMarked: isMarked,
			}
		}

		result.Chapters[i] = types.Chapter{
			SerieId:  item.SerieId,
			Slug:     item.Slug,
			Title:    item.Title,
			CoverArt: coverArt,
			User:     userData,
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
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
			Path:        "/series/:id",
			DataType:    types.GetSerieById{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetSerieById,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},

		Handler{
			Name:        "GetSerieChapters",
			Method:      http.MethodGet,
			Path:        "/series/:id/chapters",
			DataType:    types.GetSerieChaptersById{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetSerieChaptersById,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},
	)
}
