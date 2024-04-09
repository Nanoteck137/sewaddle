package handlers

import (
	"fmt"
	"reflect"
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/golang-jwt/jwt/v5"
	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

// TODO(patrik): Check confirmPassword
func (api *ApiConfig) HandlePostSignup(c echo.Context) error {
	var body types.ApiPostRegisterBody
	err := c.Bind(&body)
	if err != nil {
		return err
	}

	var validate = validator.New(validator.WithRequiredStructEnabled())
	validate.RegisterTagNameFunc(func(field reflect.StructField) string {
		name := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]

		if name == "-" {
			return ""
		}

		return name
	})

	pretty.Println(body)

	err = validate.Struct(body)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Println(err.Namespace())
			fmt.Println(err.Field())
			fmt.Println(err.StructNamespace())
			fmt.Println(err.StructField())
			fmt.Println(err.Tag())
			fmt.Println(err.ActualTag())
			fmt.Println(err.Kind())
			fmt.Println(err.Type())
			fmt.Println(err.Value())
			fmt.Println(err.Param())
			fmt.Println()
		}

		return c.JSON(400, map[string]any{
			"message": "Invalid body",
		})
	}

	user, err := api.database.CreateUser(c.Request().Context(), body.Username, body.Password)
	if err != nil {
		return err
	}

	return c.JSON(200, types.NewApiSuccessResponse(types.ApiPostRegister{
		Id:       user.Id,
		Username: user.Username,
	}))
}

func (api *ApiConfig) HandlePostSignin(c echo.Context) error {
	var body types.ApiPostLoginBody
	err := c.Bind(&body)
	if err != nil {
		return err
	}

	var validate = validator.New(validator.WithRequiredStructEnabled())
	validate.RegisterTagNameFunc(func(field reflect.StructField) string {
		name := strings.SplitN(field.Tag.Get("json"), ",", 2)[0]

		if name == "-" {
			return ""
		}

		return name
	})

	pretty.Println(body)

	err = validate.Struct(body)
	if err != nil {
		for _, err := range err.(validator.ValidationErrors) {
			fmt.Println(err.Namespace())
			fmt.Println(err.Field())
			fmt.Println(err.StructNamespace())
			fmt.Println(err.StructField())
			fmt.Println(err.Tag())
			fmt.Println(err.ActualTag())
			fmt.Println(err.Kind())
			fmt.Println(err.Type())
			fmt.Println(err.Value())
			fmt.Println(err.Param())
			fmt.Println()
		}

		return c.JSON(400, map[string]any{
			"message": "Invalid body",
		})
	}

	user, err := api.database.GetUserByUsername(c.Request().Context(), body.Username)
	if err != nil {
		return err
	}

	if user.Password != body.Password {
		return c.JSON(400, map[string]any{
			"message": "Password mismatch",
		})
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"userId": user.Id,
		"iat":    time.Now().Unix(),
		"exp":    time.Now().Add(1000 * time.Second).Unix(),
	})

	tokenString, err := token.SignedString(([]byte)("SOME SECRET"))
	if err != nil {
		return err
	}

	return c.JSON(200, types.NewApiSuccessResponse(types.ApiPostLogin{
		Token: tokenString,
	}))
}

func (api *ApiConfig) User(c echo.Context) (database.User, error) {
	authHeader := c.Request().Header.Get("Authorization")
	tokenString, err := utils.ParseAuthHeader(authHeader)
	if err != nil {
		return database.User{}, err
	}

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte("SOME SECRET"), nil
	})

	if err != nil {
		return database.User{}, types.ErrInvalidToken
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if err := api.jwtValidator.Validate(token.Claims); err != nil {
			return database.User{}, types.ErrInvalidToken
		}

		userId := claims["userId"].(string)
		user, err := api.database.GetUserById(c.Request().Context(), userId)
		if err != nil {
			return database.User{}, err
		}

		return user, nil
	}

	return database.User{}, types.ErrInvalidToken
}

func (api *ApiConfig) HandleGetMe(c echo.Context) error {
	user, err := api.User(c)
	if err != nil {
		return err
	}

	return c.JSON(200, types.NewApiSuccessResponse(types.ApiGetMe{
		Id:       user.Id,
		Username: user.Username,
	}))
}

func InstallAuthHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/signup", api.HandlePostSignup)
	g.POST("/signin", api.HandlePostSignin)
	g.GET("/me", api.HandleGetMe)
}
