package handlers

import (
	"fmt"

	"github.com/doug-martin/goqu/v9"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandleGetSeries(c echo.Context) error {
	chapterCount := api.dialect.
		From("chapters").
		Select(goqu.C("serie_id"), goqu.COUNT(goqu.C("id")).As("count")).
		GroupBy("chapters.serie_id").
		As("chapterCount")

	fmt.Println(chapterCount.ToSQL())

	sql, _, err := chapterCount.ToSQL()
	rows, err := api.db.Query(c.Request().Context(), sql) 

	var i []map[string]any
	err = pgxscan.ScanAll(&i, rows)

	pretty.Println(i)

	sql, _, err = api.dialect.
		From("series").
		Select("series.id", "series.name", goqu.C("chapterCount.count").As("count")).
		LeftJoin(chapterCount, goqu.On(goqu.Ex{"series.id": "chapterCount.serie_id"})).
		ToSQL()
	if err != nil {
		return err
	}

	fmt.Printf("sql: %v\n", sql)

	rows, err = api.db.Query(c.Request().Context(), sql)
	if err != nil {
		return err
	}

	type DbItem struct {
		Id    string
		Name  string
		Count int
	}

	var dbItems []DbItem
	err = pgxscan.ScanAll(&dbItems, rows)
	if err != nil {
		return err
	}

	result := types.ApiGetSeries{
		Series: make([]types.ApiGetSeriesItem, len(dbItems)),
	}

	for i, item := range dbItems {
		result.Series[i] = types.ApiGetSeriesItem{
			Id:           item.Id,
			Name:         item.Name,
			ChapterCount: item.Count,
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
