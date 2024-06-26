package handlers

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandleGetChapters(c echo.Context) error {
	chapters, err := api.database.GetAllChapters(c.Request().Context())
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

func (api *ApiConfig) HandleGetChapterById(c echo.Context) error {
	serieId := c.Param("serieId")
	chapterNumber, err := strconv.Atoi(c.Param("chapterNumber"))
	if err != nil {
		// TODO(patrik): Custom error
		return err
	}

	chapter, err := api.database.GetChapter(c.Request().Context(), serieId, chapterNumber)
	if err != nil {
		return err
	}

	nextChapterNumber, err := api.database.GetNextChapter(c.Request().Context(), chapter.SerieId, chapter.Number)
	if err != nil {
		return err
	}

	var nextChapter *int
	if nextChapterNumber != -1 {
		nextChapter = &nextChapterNumber
	}

	prevChapterNumber, err := api.database.GetPrevChapter(c.Request().Context(), chapter.SerieId, chapter.Number)
	if err != nil {
		return err
	}

	var prevChapter *int
	if prevChapterNumber != -1 {
		prevChapter = &prevChapterNumber
	}

	var userData *types.ChapterUserData

	user, err := api.User(c)
	fmt.Printf("err: %v\n", err)
	if err == nil {
		isMarked, err := api.database.IsChapterMarked(c.Request().Context(), user.Id, chapter.SerieId, chapter.Number)
		if err != nil {
			return err
		}

		userData = &types.ChapterUserData{
			IsMarked: isMarked,
		}
	}

	pages := strings.Split(chapter.Pages, ",")
	for i, page := range pages {
		pages[i] = ConvertURL(c, fmt.Sprintf("/chapters/%s/%v/%s", chapter.SerieId, chapter.Number, page))
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

// TODO(patrik): Remove
func (api *ApiConfig) HandlePostChapterMarkById(c echo.Context) error {
	serieId := c.Param("serieId")
	chapterNumber, err := strconv.Atoi(c.Param("chapterNumber"))
	if err != nil {
		// TODO(patrik): Custom error
		return err
	}

	user, err := api.User(c)
	if err != nil {
		return err
	}

	err = api.database.MarkChapter(c.Request().Context(), user.Id, serieId, chapterNumber)
	if err != nil {
		return err
	}

	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func (api *ApiConfig) HandlePostChapterUnmarkById(c echo.Context) error {
	serieId := c.Param("serieId")
	chapterNumber, err := strconv.Atoi(c.Param("chapterNumber"))
	if err != nil {
		// TODO(patrik): Custom error
		return err
	}

	user, err := api.User(c)
	if err != nil {
		return err
	}

	err = api.database.UnmarkChapter(c.Request().Context(), user.Id, serieId, chapterNumber)
	if err != nil {
		return err
	}

	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func InstallChapterHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/chapters", api.HandleGetChapters)
	g.GET("/chapters/:serieId/:chapterNumber", api.HandleGetChapterById)
	g.POST("/chapters/:serieId/:chapterNumber/mark", api.HandlePostChapterMarkById)
	g.POST("/chapters/:serieId/:chapterNumber/unmark", api.HandlePostChapterUnmarkById)
}
