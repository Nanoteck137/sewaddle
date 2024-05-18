package handlers

import "github.com/labstack/echo/v4"


func (api *ApiConfig) HandleGetSystemInfo(c echo.Context) error {
	return nil
}

func InstallSystemHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/system/info", api.HandleGetSystemInfo)
}
