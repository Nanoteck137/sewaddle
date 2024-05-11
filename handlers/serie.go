package handlers

import (
	"fmt"
	"strings"

	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func ConvertURL(c echo.Context, path string) string {
	host := c.Request().Host

	scheme := "http"

	h := c.Request().Header.Get("X-Forwarded-Proto")
	if h != "" {
		scheme = h
	}

	return fmt.Sprintf("%s://%s%s", scheme, host, path)
}

func (api *ApiConfig) HandleGetSeries(c echo.Context) error {
	items, err := api.database.GetAllSeries(c.Request().Context())
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
			Cover:        ConvertURL(c, "/images/"+item.Cover),
			ChapterCount: item.ChapterCount,
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

func (api *ApiConfig) HandleGetSerieById(c echo.Context) error {
	id := c.Param("id")
	serie, err := api.database.GetSerieById(c.Request().Context(), id)
	if err != nil {
		return err
	}

	var userData *types.SerieUserData

	user, err := api.User(c);
	if user != nil {
		var bookmark *types.Bookmark

		dbBookmark, err := api.database.GetBookmark(c.Request().Context(), user.Id, serie.Id)
		if err != nil && err != types.ErrNoBookmark {
			return err
		}

		if err != types.ErrNoBookmark {
			bookmark = &types.Bookmark{
				ChapterNumber: dbBookmark.ChapterNumber,
				Page:          dbBookmark.Page,
			}
		}

		userData = &types.SerieUserData{
			Bookmark: bookmark,
		}
	}

	result := types.GetSerieById{
		Id:           serie.Id,
		Name:         serie.Name,
		Cover:        ConvertURL(c, "/images/"+serie.Cover),
		ChapterCount: serie.ChapterCount,
		User:         userData,
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

func (api *ApiConfig) HandleGetSerieChaptersById(c echo.Context) error {
	id := c.Param("id")

	items, err := api.database.GetSerieChaptersById(c.Request().Context(), id)
	if err != nil {
		return err
	}

	result := types.GetSerieChaptersById{
		Chapters: make([]types.Chapter, len(items)),
	}

	var markedChapters []int

	user, _ := api.User(c)
	if user != nil {
		markedChapters, err = api.database.GetAllMarkedChapters(c.Request().Context(), user.Id, id)
		if err != nil {
			return err
		}
	}

	isChapterMarked := func(chapterNumber int) bool {
		if markedChapters == nil {
			return false
		}

		for _, item := range markedChapters {
			if item == chapterNumber {
				return true
			}
		}

		return false
	}

	for i, item := range items {
		pages := strings.Split(item.Pages, ",")
		coverArt := ConvertURL(c, fmt.Sprintf("/chapters/%s/%v/%s", item.SerieId, item.Number, pages[0]))

		var userData *types.ChapterUserData
		if user != nil {
			isMarked := isChapterMarked(item.Number)

			userData = &types.ChapterUserData{
				IsMarked: isMarked,
			}
		}

		result.Chapters[i] = types.Chapter{
			SerieId:  item.SerieId,
			Number:   item.Number,
			Title:    item.Title,
			CoverArt: coverArt,
			User:     userData,
		}
	}

	return c.JSON(200, types.NewApiSuccessResponse(result))
}

// TODO(patrik): Add page
func (api *ApiConfig) HandlePostSerieUpdate(c echo.Context) error {
	user, err := api.User(c)
	if err != nil {
		return err
	}

	var body types.ApiPostSerieUpdateBody
	err = c.Bind(&body)
	if err != nil {
		return err
	}

	pretty.Println(body)

	ctx := c.Request().Context()

	serie, err := api.database.GetSerieById(ctx, body.SerieId)
	if err != nil {
		return err
	}

	chapter, err := api.database.GetChapter(ctx, body.SerieId, body.ChapterNumber)
	if err != nil {
		return err
	}

	// TODO(patrik): Check chapter.serieId

	has, err := api.database.HasBookmark(ctx, user.Id, serie.Id)
	if err != nil {
		return err
	}

	fmt.Printf("chapter.Id: %v\n", chapter.Number)

	// if !has {
	// 	err := api.database.CreateBookmark(ctx, user.Id, serie.Id, chapter.Id)
	// 	if err != nil {
	// 		return err
	// 	}
	// } else {
	// 	if chapterId != chapter.Id {
	// 		err := api.database.UpdateBookmark(ctx, user.Id, serie.Id, chapter.Id)
	// 		if err != nil {
	// 			return err
	// 		}
	// 	}
	// }

	fmt.Printf("has: %v\n", has)

	return nil
}

func InstallSerieHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/series", api.HandleGetSeries)
	g.GET("/series/:id", api.HandleGetSerieById)
	g.GET("/series/:id/chapters", api.HandleGetSerieChaptersById)
	// TODO(patrik): Rename
	g.POST("/series/update", api.HandlePostSerieUpdate)
}
