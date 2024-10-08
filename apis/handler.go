package apis

import (
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/pyrin/api"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
)

type Handler struct {
	Name        string
	Method      string
	Path        string
	DataType    any
	BodyType    types.Body
	Errors      []api.ErrorType
	HandlerFunc echo.HandlerFunc
	Middlewares []echo.MiddlewareFunc
}

type Group interface {
	Register(handlers ...Handler)
}

func InstallHandlers(app core.App, g Group) {
	InstallSerieHandlers(app, g)
	InstallChapterHandlers(app, g)
	InstallLibraryHandlers(app, g)
	InstallUserHandlers(app, g)
	InstallSystemHandlers(app, g)
	InstallAuthHandlers(app, g)
}
