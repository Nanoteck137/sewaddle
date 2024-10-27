package apis

import (
	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle/core"
)

func InstallHandlers(app core.App, g pyrin.Group) {
	InstallSerieHandlers(app, g)
	InstallChapterHandlers(app, g)
	InstallLibraryHandlers(app, g)
	InstallUserHandlers(app, g)
	InstallSystemHandlers(app, g)
	InstallAuthHandlers(app, g)
}
