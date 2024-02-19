package handlers

import (
	"errors"
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func ErrorHandler(err error, c echo.Context) {
	switch {
	case errors.Is(err, types.ErrInvalidToken):
		c.JSON(http.StatusUnauthorized, map[string]any{
			"error": err.Error(),
		})
	default:
		c.JSON(http.StatusInternalServerError, map[string]any{
			"error": err.Error(),
		})
	}

}
