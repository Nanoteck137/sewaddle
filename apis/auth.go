package apis

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	pyrinapi "github.com/nanoteck137/pyrin/api"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
)

type authApi struct {
	app core.App
}

// TODO(patrik): Check confirmPassword
func (api *authApi) HandlePostSignup(c echo.Context) error {
	body, err := Body[types.PostAuthSignupBody](c)
	if err != nil {
		return err
	}

	user, err := api.app.DB().CreateUser(c.Request().Context(), body.Username, body.Password)
	if err != nil {
		return err
	}

	return c.JSON(200, pyrinapi.SuccessResponse(types.PostAuthSignup{
		Id:       user.Id,
		Username: user.Username,
	}))
}

func (api *authApi) HandlePostSignin(c echo.Context) error {
	body, err := Body[types.PostAuthSigninBody](c)
	if err != nil {
		return err
	}

	user, err := api.app.DB().GetUserByUsername(c.Request().Context(), body.Username)
	if err != nil {
		return err
	}

	if user.Password != body.Password {
		return types.ErrIncorrectCreds
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.Id,
		"iat":    time.Now().Unix(),
		// "exp":    time.Now().Add(1000 * time.Second).Unix(),
	})

	tokenString, err := token.SignedString(([]byte)(api.app.Config().JwtSecret))
	if err != nil {
		return err
	}

	return c.JSON(200, pyrinapi.SuccessResponse(types.PostAuthSignin{
		Token: tokenString,
	}))
}

func (api *authApi) HandleGetMe(c echo.Context) error {
	user, err := User(api.app, c)
	if err != nil {
		return err
	}

	isOwner := api.app.DBConfig().OwnerId == user.Id

	return c.JSON(200, pyrinapi.SuccessResponse(types.GetAuthMe{
		Id:       user.Id,
		Username: user.Username,
		IsOwner:  isOwner,
	}))
}

func InstallAuthHandlers(app core.App, group Group) {
	api := authApi{app: app}

	group.Register(
		Handler{
			Name:        "Signup",
			Path:        "/auth/signup",
			Method:      http.MethodPost,
			DataType:    types.PostAuthSignup{},
			BodyType:    types.PostAuthSignupBody{},
			HandlerFunc: api.HandlePostSignup,
			Middlewares: []echo.MiddlewareFunc{},
		},

		Handler{
			Name:        "Signin",
			Path:        "/auth/signin",
			Method:      http.MethodPost,
			DataType:    types.PostAuthSignin{},
			BodyType:    types.PostAuthSigninBody{},
			HandlerFunc: api.HandlePostSignin,
			Middlewares: []echo.MiddlewareFunc{},
		},

		Handler{
			Name:        "GetMe",
			Path:        "/auth/me",
			Method:      http.MethodGet,
			DataType:    types.GetAuthMe{},
			BodyType:    nil,
			HandlerFunc: api.HandleGetMe,
			Middlewares: []echo.MiddlewareFunc{},
		},
	)
}
