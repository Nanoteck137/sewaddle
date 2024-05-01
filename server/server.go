package server

import (
	"github.com/MadAppGang/httplog/echolog"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/handlers"
	"github.com/nanoteck137/sewaddle/types"
)

type Server struct {
	e *echo.Echo
}

func New(db *database.Database, workDir types.WorkDir) *Server {
	e := echo.New()

	e.Debug = true
	e.HTTPErrorHandler = handlers.ErrorHandler

	e.Use(echolog.LoggerWithName("Sewaddle"))
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.Static("/images", workDir.ImagesDir())
	e.Static("/chapters", workDir.ChaptersDir())

	apiConfig := handlers.New(db)

	apiGroup := e.Group("/api")

	v1Group := apiGroup.Group("/v1")
	handlers.InstallSerieHandlers(v1Group, apiConfig)
	handlers.InstallChapterHandlers(v1Group, apiConfig)
	handlers.InstallUserHandlers(v1Group, apiConfig)

	authGroup := apiGroup.Group("/auth")
	handlers.InstallAuthHandlers(authGroup, apiConfig)

	return &Server{
		e: e,
	}
}

func (server *Server) Start(addr string) error {
	return server.e.Start(addr)
}
