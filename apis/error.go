package apis

import (
	"net/http"

	"github.com/nanoteck137/pyrin"
)

const (
	TypeSerieNotFound pyrin.ErrorType = "SERIE_NOT_FOUND"
)

func SerieNotFound() *pyrin.Error {
	return &pyrin.Error{
		Code:    http.StatusNotFound,
		Type:    TypeSerieNotFound,
		Message: "Serie not found",
	}
}
