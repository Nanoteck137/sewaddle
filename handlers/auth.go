package handlers

import (
	"github.com/go-playground/validator/v10"
	"github.com/kr/pretty"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandlePostRegister(c echo.Context) error {
	var body types.ApiPostRegisterBody 
	err := c.Bind(&body)
	if err != nil {
		return err
	}

	var validate = validator.New(validator.WithRequiredStructEnabled())

	pretty.Println(body)

	err = validate.Struct(body)
	pretty.Println(err)

	return nil
}

func InstallAuthHandlers(g *echo.Group, api *ApiConfig) {
	g.POST("/register", api.HandlePostRegister)
}
