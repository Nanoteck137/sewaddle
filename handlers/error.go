package handlers

import (
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func ErrorHandler(err error, c echo.Context) {
	switch err := err.(type) {
	case *types.ApiError:
		c.JSON(err.Code, types.ApiResponse{
			Status: types.StatusError,
			Error:  err,
		})
	case *echo.HTTPError:
		c.JSON(err.Code, types.ApiResponse{
			Status: types.StatusError,
			Error:  types.NewApiError(err.Code, err.Error()),
		})
	default:
		c.JSON(500, types.ApiResponse{
			Status: types.StatusError,
			Error:  types.NewApiError(500, err.Error()),
		})
	}
}
