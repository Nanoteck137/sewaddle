package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandleGetSystemInfo(c echo.Context) error {
	return c.JSON(200, types.NewApiSuccessResponse(types.GetSystemInfo{
		IsSetup: false,
	}))
}

func InstallSystemHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/system/info", api.HandleGetSystemInfo)
}
