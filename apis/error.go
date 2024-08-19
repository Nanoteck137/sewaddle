package apis

import (
	"net/http"

	"github.com/nanoteck137/pyrin/api"
)

const (
	ErrTypeUnknownError api.ErrorType = "UNKNOWN_ERROR"
	TypeSerieNotFound   api.ErrorType = "SERIE_NOT_FOUND"
	TypeRouteNotFound   api.ErrorType = "ROUTE_NOT_FOUND"
)

func SerieNotFound() *api.Error {
	return &api.Error{
		Code:    http.StatusNotFound,
		Type:    TypeSerieNotFound,
		Message: "Serie not found",
	}
}

func RouteNotFound() *api.Error {
	return &api.Error{
		Code:    http.StatusNotFound,
		Type:    TypeRouteNotFound,
		Message: "Route not found",
	}
}
