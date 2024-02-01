package api

import (
	"context"
	"fmt"
	"log"

	"github.com/MadAppGang/httplog/echolog"
	"github.com/doug-martin/goqu/v9"
	_ "github.com/doug-martin/goqu/v9/dialect/postgres"
	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
)

var dialect = goqu.Dialect("postgres")

func New(db *pgxpool.Pool) *echo.Echo {
	e := echo.New()

	e.Use(echolog.LoggerWithName("Sewaddle"))

	tag, err := db.Exec(context.Background(), "INSERT INTO series VALUES ('id', 'hello')")
	if err != nil {
		log.Print(err)
	}

	fmt.Println(tag)

	e.GET("/test", func(c echo.Context) error {
		return c.JSON(200, echo.Map{
			"message": "Hello World",
		})
	})

	e.GET("/api/v1/series", func(c echo.Context) error {
		sql, _, err := dialect.From("series").Select("id", "name").ToSQL()
		if err != nil {
			return err
		}

		type Result struct {
			Id string
			Name string
		}

		rows, err := db.Query(c.Request().Context(), sql)
		if err != nil {
			return err
		}

		var res []*Result
		err = pgxscan.ScanAll(&res, rows)
		if err != nil {
			return err
		}

		pretty.Println(res)

		return c.JSON(200, res)
	})

	return e
}
