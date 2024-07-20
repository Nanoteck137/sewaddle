package apis

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

type chapterApi struct {
	app core.App
}

func (api *chapterApi) HandleGetChapters(c echo.Context) error {
	chapters, err := api.app.DB().GetAllChapters(c.Request().Context())
	if err != nil {
		return err
	}

	result := types.GetChapters{
		Chapters: make([]types.Chapter, len(chapters)),
	}

	for i, chapter := range chapters {
		result.Chapters[i] = types.Chapter{
			SerieId: chapter.SerieId,
			Number:  chapter.Number,
			Title:   chapter.Title,
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

func (api *chapterApi) HandleGetChapterById(c echo.Context) error {
	serieId := c.Param("serieId")
	chapterNumber, err := strconv.Atoi(c.Param("chapterNumber"))
	if err != nil {
		// TODO(patrik): Custom error
		return err
	}

	chapter, err := api.app.DB().GetChapter(c.Request().Context(), serieId, chapterNumber)
	if err != nil {
		return err
	}

	nextChapterNumber, err := api.app.DB().GetNextChapter(c.Request().Context(), chapter.SerieId, chapter.Number)
	if err != nil {
		return err
	}

	var nextChapter *int
	if nextChapterNumber != -1 {
		nextChapter = &nextChapterNumber
	}

	prevChapterNumber, err := api.app.DB().GetPrevChapter(c.Request().Context(), chapter.SerieId, chapter.Number)
	if err != nil {
		return err
	}

	var prevChapter *int
	if prevChapterNumber != -1 {
		prevChapter = &prevChapterNumber
	}

	var userData *types.ChapterUserData

	user, err := User(api.app, c)
	if err == nil {
		isMarked, err := api.app.DB().IsChapterMarked(c.Request().Context(), user.Id, chapter.SerieId, chapter.Number)
		if err != nil {
			return err
		}

		userData = &types.ChapterUserData{
			IsMarked: isMarked,
		}
	}

	pages := strings.Split(chapter.Pages, ",")
	for i, page := range pages {
		pages[i] = utils.ConvertURL(c, fmt.Sprintf("/chapters/%s/%v/%s", chapter.SerieId, chapter.Number, page))
	}

	result := types.GetChapterById{
		Chapter:     types.Chapter{
			SerieId:  chapter.SerieId,
			Number:   chapter.Number,
			Title:    chapter.Title,
			CoverArt: pages[0],
			User:     userData,
		},
		NextChapter: nextChapter,
		PrevChapter: prevChapter,
		Pages:       pages,
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

func InstallChapterHandlers(app core.App, group Group) {
	api := chapterApi{app: app}

	requireSetup := RequireSetup(app)

	// g.GET("/chapters", api.HandleGetChapters)
	// g.GET("/chapters/:serieId/:chapterNumber", api.HandleGetChapterById)

	group.Register(
		Handler{
			Name:        "GetChapters",
			Method:      http.MethodGet,
			Path:        "/chapters",
			DataType:    types.GetChapters{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetChapters,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},
		Handler{
			// TODO(patrik): Rename GetChapterById?
			Name:        "GetChapterById",
			Method:      http.MethodGet,
			Path:        "/chapters/:serieId/:chapterNumber",
			DataType:    types.GetChapterById{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetChapterById,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},
	)
}
