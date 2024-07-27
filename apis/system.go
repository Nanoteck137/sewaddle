package apis

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/config"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
)

type systemApi struct {
	app core.App
}

func (api *systemApi) HandleGetSystemInfo(c echo.Context) error {
	return c.JSON(200, types.NewApiSuccessResponse(types.GetSystemInfo{
		Version: config.Version,
		IsSetup: api.app.IsSetup(),
	}))
}

func (api *systemApi) HandlePostSystemSetup(c echo.Context) error {
	if api.app.IsSetup() {
		return types.NewApiError(400, "System already setup")
	}

	body, err := Body[types.PostSystemSetupBody](c)
	if err != nil {
		return err
	}

	db, tx, err := api.app.DB().Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	user, err := db.CreateUser(c.Request().Context(), body.Username, body.Password)
	if err != nil {
		return err
	}

	_, err = db.CreateConfig(c.Request().Context(), user.Id)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	err = api.app.InvalidateDBConfig()
	if err != nil {
		return err
	}

	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func InstallSystemHandlers(app core.App, group Group) {
	api := systemApi{app: app}

	group.Register(
		Handler{
			Name:        "GetSystemInfo",
			Path:        "/system/info",
			Method:      http.MethodGet,
			DataType:    types.GetSystemInfo{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetSystemInfo,
		},

		Handler{
			Name:        "RunSystemSetup",
			Path:        "/system/setup",
			Method:      http.MethodPost,
			DataType:    nil,
			BodyType:    types.PostSystemSetupBody{},
			HandlerFunc: api.HandlePostSystemSetup,
		},
	)
}
