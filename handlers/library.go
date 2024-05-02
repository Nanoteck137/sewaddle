package handlers

import (
	"log"
	"sync/atomic"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/library"
	"github.com/nanoteck137/sewaddle/types"
)

var syncing atomic.Bool

func (api *ApiConfig) HandleGetLibraryStatus(c echo.Context) error {
	return c.JSON(200, types.NewApiSuccessResponse(types.GetLibraryStatus{
		Syncing: syncing.Load(),
	}))
}

func (api *ApiConfig) HandlePostLibrarySync(c echo.Context) error {

	go func(){
		syncing.Store(true)
		defer syncing.Store(false)

		// TODO(patrik): Don't hard code library path
		lib, err := library.ReadFromDir("/Volumes/media/manga")
		if err != nil {
			log.Fatal("Failed to read library:", err)
		}

		lib.Sync(api.database, api.workDir)
	}()

	return c.JSON(200, types.NewApiSuccessResponse(nil))
}

func InstallLibraryHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/library/status", api.HandleGetLibraryStatus)
	g.POST("/library/sync", api.HandlePostLibrarySync)
}
