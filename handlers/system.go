package handlers

import (
	"context"

	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
)

var config *database.Config

func isSetup() bool {
	return config != nil
}

func (api *ApiConfig) HandleGetSystemInfo(c echo.Context) error {
	return c.JSON(200, types.NewApiSuccessResponse(types.GetSystemInfo{
		Version: "0.0.0",
		IsSetup: isSetup(),
	}))
}

func (api *ApiConfig) HandlePostSystemSetup(c echo.Context) error {
	if isSetup() {
		return types.NewApiError(400, "System already setup")
	}

	var body types.PostSystemSetupBody
	err := c.Bind(&body)
	if err != nil {
		return err
	}

	db, tx, err := api.database.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	user, err := db.CreateUser(c.Request().Context(), body.Username, body.Password)
	if err != nil {
		return err
	}

	conf, err := db.CreateConfig(c.Request().Context(), user.Id)
	if err != nil {
		return err
	}

	pretty.Println(body)

	err = tx.Commit()
	if err != nil {
		return err
	}

	config = &conf


	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func InstallSystemHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/system/info", api.HandleGetSystemInfo)
	g.POST("/system/setup", api.HandlePostSystemSetup)
}

func InitializeConfig(db *database.Database) error {
	conf, err := db.GetConfig(context.Background())
	if err != nil {
		return err
	}

	config = conf

	return nil
}
