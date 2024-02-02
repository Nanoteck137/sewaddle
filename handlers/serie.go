package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandleGetSeries(c echo.Context) error {
	items, err := api.database.GetAllSeries(c.Request().Context())
	if err != nil {
		return err
	}

	result := types.ApiGetSeries{
		Series: make([]types.ApiGetSeriesItem, len(items)),
	}

	for i, item := range items {
		result.Series[i] = types.ApiGetSeriesItem{
			Id:           item.Id,
			Name:         item.Name,
			ChapterCount: item.ChapterCount,
		}
	}

	return c.JSON(200, result)
}

func (api *ApiConfig) HandleGetSerieById(c echo.Context) error {
	return nil
}

func InstallSerieHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/series", api.HandleGetSeries)
	g.GET("/series/:id", api.HandleGetSerieById)
}
