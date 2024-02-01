package api

import (
	"github.com/MadAppGang/httplog/echolog"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/nanoteck137/sewaddle/handlers"
)

func New(db *pgxpool.Pool) *echo.Echo {
	e := echo.New()

	e.Debug = true

	e.Use(echolog.LoggerWithName("Sewaddle"))
	e.Use(middleware.Recover())

	apiConfig := handlers.New(db)

	apiGroup := e.Group("/api/v1")
	handlers.InstallSerieHandlers(apiGroup, apiConfig)

	return e
}
