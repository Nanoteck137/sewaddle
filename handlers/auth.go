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
	"github.com/nanoteck137/sewaddle/types"
)

// TODO(patrik): Check confirmPassword
func (api *ApiConfig) HandlePostRegister(c echo.Context) error {
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

	return c.JSON(200, types.CreateResponse(types.ApiPostRegister{
		Id:       user.Id,
		Username: user.Username,
	}))
}

func (api *ApiConfig) HandlePostLogin(c echo.Context) error {
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
		"foo": "bar",
		"iat": time.Now().Unix(),
		"nbf": time.Now().Add(10 * time.Second).Unix(),
	})

	tokenString, err := token.SignedString(([]byte)("SOME SECRET"))
	if err != nil {
		return err
	}

	return c.JSON(200, types.CreateResponse(types.ApiPostLogin{
		Token: tokenString,
	}))
}

func InstallAuthHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/register", api.HandlePostRegister)
	g.POST("/login", api.HandlePostLogin)
}
