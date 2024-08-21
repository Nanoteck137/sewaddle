package apis

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
	pyrinapi "github.com/nanoteck137/pyrin/api"
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
			SerieSlug: chapter.SerieSlug,
			Slug:      chapter.Slug,
			Title:     chapter.Title,
		}
	}

	return c.JSON(200, pyrinapi.SuccessResponse(result))
}

func (api *chapterApi) HandleGetChapterBySlug(c echo.Context) error {
	serieId := c.Param("serieSlug")
	slug := c.Param("slug")

	chapter, err := api.app.DB().GetChapter(c.Request().Context(), serieId, slug)
	if err != nil {
		return err
	}

	nextChapterSlug, err := api.app.DB().GetNextChapter(c.Request().Context(), chapter.SerieSlug, chapter.Number)
	if err != nil {
		return err
	}

	var nextChapter *string
	if nextChapterSlug != "" {
		nextChapter = &nextChapterSlug
	}

	prevChapterSlug, err := api.app.DB().GetPrevChapter(c.Request().Context(), chapter.SerieSlug, chapter.Number)
	if err != nil {
		return err
	}

	var prevChapter *string
	if prevChapterSlug != "" {
		prevChapter = &prevChapterSlug
	}

	var userData *types.ChapterUserData

	user, err := User(api.app, c)
	if err == nil {
		isMarked, err := api.app.DB().IsChapterMarked(c.Request().Context(), user.Id, chapter.SerieSlug, chapter.Slug)
		if err != nil {
			return err
		}

		userData = &types.ChapterUserData{
			IsMarked: isMarked,
		}
	}

	pages := strings.Split(chapter.Pages, ",")
	for i, page := range pages {
		pages[i] = utils.ConvertURL(c, fmt.Sprintf("/files/chapters/%s/%s/%s", chapter.SerieSlug, chapter.Slug, page))
	}

	result := types.GetChapterBySlug{
		Chapter: types.Chapter{
			SerieSlug: chapter.SerieSlug,
			Slug:      chapter.Slug,
			Title:     chapter.Title,
			CoverArt:  pages[0],
			User:      userData,
		},
		NextChapter: nextChapter,
		PrevChapter: prevChapter,
		Pages:       pages,
	}

	return c.JSON(200, pyrinapi.SuccessResponse(result))
}

func InstallChapterHandlers(app core.App, group Group) {
	api := chapterApi{app: app}

	group.Register(
		Handler{
			Name:        "GetChapters",
			Method:      http.MethodGet,
			Path:        "/chapters",
			DataType:    types.GetChapters{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetChapters,
			Middlewares: []echo.MiddlewareFunc{},
		},
		Handler{
			Name:        "GetChapterBySlug",
			Method:      http.MethodGet,
			Path:        "/chapters/:serieSlug/:slug",
			DataType:    types.GetChapterBySlug{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetChapterBySlug,
			Middlewares: []echo.MiddlewareFunc{},
		},
	)
}
