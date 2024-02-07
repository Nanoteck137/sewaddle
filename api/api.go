package api

import (
	"github.com/MadAppGang/httplog/echolog"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/handlers"
)

func New(conn *pgxpool.Pool) *echo.Echo {
	e := echo.New()

	e.Debug = true

	e.Use(echolog.LoggerWithName("Sewaddle"))
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.Static("/images", "./work/images")
	e.Static("/chapters", "./work/chapters")

	db := database.New(conn)
	apiConfig := handlers.New(db)

	apiGroup := e.Group("/api/v1")
	handlers.InstallSerieHandlers(apiGroup, apiConfig)
	handlers.InstallChapterHandlers(apiGroup, apiConfig)

	apiGroup = apiGroup.Group("/auth")
	handlers.InstallAuthHandlers(apiGroup, apiConfig)

	return e
}
