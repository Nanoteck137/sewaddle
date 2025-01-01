package apis

import (
	"net/http"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
)

func InstallSystemHandlers(app core.App, group pyrin.Group) {
	group.Register(
		pyrin.ApiHandler{
			Name:         "GetSystemInfo",
			Path:         "/system/info",
			Method:       http.MethodGet,
			ResponseType: types.GetSystemInfo{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				return types.GetSystemInfo{
					Version: sewaddle.Version,
				}, nil
			},
		},
	)
}
