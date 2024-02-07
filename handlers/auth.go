package handlers

import (
	"github.com/gogo/protobuf/types"
	"github.com/labstack/echo/v4"
)

func (api *ApiConfig) HandlePostRegister(c echo.Context) error {
	var body types.

	return nil
}

func InstallAuthHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/register", api.HandlePostRegister)
}
