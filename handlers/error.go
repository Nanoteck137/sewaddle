package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func ErrorHandler(err error, c echo.Context) {
	code := http.StatusInternalServerError

	if apiError, ok := err.(*types.ApiError); ok {
		code = apiError.Code
	}

	c.JSON(code, map[string]any{
		"error": err.Error(),
	})

}
