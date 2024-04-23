package handlers

import "github.com/labstack/echo/v4"

func (api *ApiConfig) HandlePostMarkChapters(c echo.Context) error {
	return nil
}

func (api *ApiConfig) HandlePostUnmarkChapters(c echo.Context) error {
	return nil
}

func InstallUserHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/user/markChapters", api.HandlePostMarkChapters);
	g.POST("/user/unmarkChapters", api.HandlePostUnmarkChapters);
}
