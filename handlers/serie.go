package handlers

import (
	"fmt"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func ConvertURL(c echo.Context, path string) string {
	host := c.Request().Host

	return fmt.Sprintf("http://%s%s", host, path)
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
		if pgxscan.NotFound(err) {
			return c.JSON(404, map[string]any{
				"message": "No serie with id: " + id,
			})
		} else {
			return err
		}
	}

	result := types.Serie{
		Id:           serie.Id,
		Name:         serie.Name,
		Cover:        ConvertURL(c, "/images/"+serie.Cover),
		ChapterCount: serie.ChapterCount,
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

	for i, item := range items {
		result.Chapters[i] = types.Chapter{
			Id:      item.Id,
			Index:   item.Index,
			Title:   item.Title,
			SerieId: item.SerieId,
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

	chapter, err := api.database.GetChapterById(ctx, body.ChapterId)
	if err != nil {
		return err
	}

	// TODO(patrik): Check chapter.serieId

	has, chapterId, err := api.database.HasBookmark(ctx, user.Id, serie.Id)
	if err != nil {
		return err
	}

	fmt.Printf("chapterId: %v\n", chapterId)
	fmt.Printf("chapter.Id: %v\n", chapter.Id)

	if !has {
		err := api.database.CreateBookmark(ctx, user.Id, serie.Id, chapter.Id)
		if err != nil {
			return err
		}
	} else {
		if chapterId != chapter.Id {
			err := api.database.UpdateBookmark(ctx, user.Id, serie.Id, chapter.Id)
			if err != nil {
				return err
			}
		}
	}

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
