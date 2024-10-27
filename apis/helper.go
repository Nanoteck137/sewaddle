package apis

import (
	"fmt"
	"io"

	"github.com/faceair/jio"
	"github.com/golang-jwt/jwt/v5"
	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

func User(app core.App, c pyrin.Context) (*database.User, error) {
	authHeader := c.Request().Header.Get("Authorization")
	tokenString, err := utils.ParseAuthHeader(authHeader)
	if err != nil {
		return nil, err
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte(app.Config().JwtSecret), nil
	})

	if err != nil {
		return nil, types.ErrInvalidToken
	}

	jwtValidator := jwt.NewValidator(jwt.WithIssuedAt())

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if err := jwtValidator.Validate(token.Claims); err != nil {
			return nil, types.ErrInvalidToken
		}

		userId := claims["userId"].(string)
		user, err := app.DB().GetUserById(c.Request().Context(), userId)
		if err != nil {
			return nil, types.ErrInvalidToken
		}

		return &user, nil
	}

	return nil, types.ErrInvalidToken
}

func Body[T types.Body](c pyrin.Context) (T, error) {
	var res T

	schema := res.Schema()

	j, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return res, err
	}

	if len(j) == 0 {
		return res, types.ErrEmptyBody
	}

	data, err := jio.ValidateJSON(&j, schema)
	if err != nil {
		return res, err
	}

	err = utils.Decode(data, &res)
	if err != nil {
		return res, err
	}

	return res, nil
}
