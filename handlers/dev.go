package handlers

// func (api *ApiConfig) HandlePostToggleAdmin(c echo.Context) error {
// 	user, err := api.User(c)
// 	if err != nil {
// 		return err
// 	}
//
// 	err = api.database.SetUserAdmin(c.Request().Context(), user.Id, !user.IsAdmin)
// 	if err != nil {
// 		return err
// 	}
//
// 	return c.JSON(200, types.NewApiSuccessResponse(nil));
// }

// func InstallDevHandlers(g *echo.Group, api *ApiConfig) {
// 	g.POST("/toggle-admin", api.HandlePostToggleAdmin)
// }
