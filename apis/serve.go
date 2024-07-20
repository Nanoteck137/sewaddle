package apis

import (
	"github.com/MadAppGang/httplog/echolog"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/nanoteck137/sewaddle/config"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/nanoteck137/sewaddle/types"
)

type echoGroup struct {
	app core.App

	Prefix string
	Group  *echo.Group
}

func (g *echoGroup) Register(handlers ...Handler) {
	for _, h := range handlers {
		log.Debug("Registering", "method", h.Method, "name", h.Name, "path", g.Prefix+h.Path)
		g.Group.Add(h.Method, h.Path, h.HandlerFunc, h.Middlewares...)
	}
}

func newEchoGroup(app core.App, e *echo.Echo, prefix string, m ...echo.MiddlewareFunc) *echoGroup {
	g := e.Group(prefix, m...)

	return &echoGroup{
		app:    app,
		Prefix: prefix,
		Group:  g,
	}
}

func errorHandler(err error, c echo.Context) {
	switch err := err.(type) {
	case *types.ApiError:
		c.JSON(err.Code, types.ApiResponse{
			Status: types.StatusError,
			Error:  err,
		})
	case *echo.HTTPError:
		c.JSON(err.Code, types.ApiResponse{
			Status: types.StatusError,
			Error: &types.ApiError{
				Code:    err.Code,
				Message: err.Error(),
			},
		})
	default:
		c.JSON(500, types.ApiResponse{
			Status: types.StatusError,
			Error: &types.ApiError{
				Code:    500,
				Message: err.Error(),
			},
		})
	}
}

func Server(app core.App) (*echo.Echo, error) {
	e := echo.New()

	e.HTTPErrorHandler = errorHandler

	e.Use(echolog.LoggerWithName(config.AppName))
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.Static("/images", app.WorkDir().ImagesDir())
	e.Static("/chapters", app.WorkDir().ChaptersDir())

	g := newEchoGroup(app, e, "/api/v1")
	InstallHandlers(app, g)

	return e, nil
}
