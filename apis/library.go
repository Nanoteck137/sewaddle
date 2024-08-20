package apis

import (
	"net/http"
	"sync/atomic"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/nanoteck137/sewaddle/database/libsync"
	"github.com/nanoteck137/sewaddle/types"
	pyrinapi "github.com/nanoteck137/pyrin/api"
)

type libraryApi struct {
	app core.App
	syncing atomic.Bool
}

func (api *libraryApi) HandleGetLibraryStatus(c echo.Context) error {
	return c.JSON(200, pyrinapi.SuccessResponse(types.GetLibraryStatus{
		Syncing: api.syncing.Load(),
	}))
}

func (api *libraryApi) HandlePostLibrarySync(c echo.Context) error {
	go func(){
		api.syncing.Store(true)
		defer api.syncing.Store(false)

		start := time.Now()

		log.Info("Sync: Reading library")
		lib, err := libsync.ReadFromDir(api.app.Config().LibraryDir)
		if err != nil {
			log.Error("Failed to sync", "err", err)
			return
		}
		log.Info("Sync: Done Reading library", "time", time.Since(start))

		start = time.Now()

		log.Info("Sync: Started Syncing library")
		lib.Sync(api.app.DB(), api.app.Config().WorkDir())
		log.Info("Sync: Done Syncing library", "time", time.Since(start))

	}()

	return c.JSON(200, pyrinapi.SuccessResponse(nil))
}

func InstallLibraryHandlers(app core.App, group Group) {
	api := libraryApi{app: app}

	requireSetup := RequireSetup(app)

	group.Register(
		Handler{
			Name:        "GetLibraryStatus",
			Method:      http.MethodGet,
			Path:        "/library/status",
			DataType:    types.GetLibraryStatus{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetLibraryStatus,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},
		Handler{
			Name:        "RunLibrarySync",
			Method:      http.MethodPost,
			Path:        "/library/sync",
			DataType:    nil,
			BodyType:    nil,
			HandlerFunc: api.HandlePostLibrarySync,
			Middlewares: []echo.MiddlewareFunc{requireSetup},
		},
	)
}
