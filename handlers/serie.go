package handlers

import (
	"fmt"

	"github.com/georgysavva/scany/v2/pgxscan"
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

	host := c.Request().Host

	url := fmt.Sprintf("http://%s", host)

	for i, item := range items {
		result.Series[i] = types.ApiGetSeriesItem{
			Id:           item.Id,
			Name:         item.Name,
			Cover:        url + "/images/" + item.Cover,
			ChapterCount: item.ChapterCount,
		}
	}

	return c.JSON(200, types.CreateResponse(result))
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

	result := types.ApiGetSerieById{
		Id:           serie.Id,
		Name:         serie.Name,
		ChapterCount: serie.ChapterCount,
	}

	return c.JSON(200, types.CreateResponse(result))
}

func InstallSerieHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/series", api.HandleGetSeries)
	g.GET("/series/:id", api.HandleGetSerieById)
}
