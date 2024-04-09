package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandleGetChapters(c echo.Context) error {
	chapters, err := api.database.GetAllChapters(c.Request().Context())
	if err != nil {
		return err
	}

	result := types.ApiGetChapters{
		Chapters: make([]types.ApiGetChaptersItem, len(chapters)),
	}

	for i, chapter := range chapters {
		result.Chapters[i] = types.ApiGetChaptersItem{
			Id:      chapter.Id,
			Index:   chapter.Index,
			Title:   chapter.Title,
			SerieId: chapter.SerieId,
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

func (api *ApiConfig) HandleGetChapterById(c echo.Context) error {
	id := c.Param("id")
	chapter, err := api.database.GetChapterById(c.Request().Context(), id)
	if err != nil {
		if pgxscan.NotFound(err) {
			return types.ErrChapterNotFound
		} else {
			return err
		}
	}

	nextId, err := api.database.GetNextChapter(c.Request().Context(), chapter.SerieId, chapter.Index)
	if err != nil {
		return err
	}

	prevId, err := api.database.GetPrevChapter(c.Request().Context(), chapter.SerieId, chapter.Index)
	if err != nil {
		return err
	}

	var userData *types.ApiGetChapterByIdUser

	user, err := api.User(c)
	fmt.Printf("err: %v\n", err)
	if err == nil {
		isMarked, err := api.database.IsChapterMarked(c.Request().Context(), user.Id, chapter.Id)
		if err != nil {
			return err
		}

		userData = &types.ApiGetChapterByIdUser{
			IsMarked: isMarked,
		}
	}

	pages := strings.Split(chapter.Pages, ",")
	for i, page := range pages {
		pages[i] = ConvertURL(c, fmt.Sprintf("/chapters/%s/%s", chapter.Id, page))
	}

	result := types.ApiGetChapterById{
		Id:            chapter.Id,
		Index:         chapter.Index,
		Title:         chapter.Title,
		SerieId:       chapter.SerieId,
		NextChapterId: nextId,
		PrevChapterId: prevId,
		Pages:         pages,
		User:          userData,
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))

}

func (api *ApiConfig) HandlePostChapterMarkById(c echo.Context) error {
	id := c.Param("id")

	user, err := api.User(c)
	if err != nil {
		return err
	}

	err = api.database.MarkChapter(c.Request().Context(), user.Id, id, true)
	if err != nil {
		return err
	}

	return c.NoContent(http.StatusNoContent)
}

func (api *ApiConfig) HandlePostChapterUnmarkById(c echo.Context) error {
	id := c.Param("id")

	user, err := api.User(c)
	if err != nil {
		return err
	}

	err = api.database.MarkChapter(c.Request().Context(), user.Id, id, false)
	if err != nil {
		return err
	}

	// TODO(patrik): NoContent
	return nil
}

func InstallChapterHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/chapters", api.HandleGetChapters)
	g.GET("/chapters/:id", api.HandleGetChapterById)
	g.POST("/chapters/:id/mark", api.HandlePostChapterMarkById)
	g.POST("/chapters/:id/unmark", api.HandlePostChapterUnmarkById)
}
