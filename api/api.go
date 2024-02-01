package api

import (
	"github.com/MadAppGang/httplog/echolog"
	"github.com/labstack/echo/v4"
)

func New() *echo.Echo {
	e := echo.New()

	e.Use(echolog.LoggerWithName("Sewaddle"))

	e.GET("/test", func(c echo.Context) error {
		return c.JSON(200, echo.Map{
			"message": "Hello World",
		})
	})

	return e
}
