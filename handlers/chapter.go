package handlers

import (
	"fmt"
	"strings"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"github.com/nanoteck137/sewaddle/types"
)

func (api *ApiConfig) HandleGetChapters(c echo.Context) error {
	chapters, err := api.database.GetAllChapters(c.Request().Context())
	if err != nil {
		return err
	}

	result := types.ApiGetChapters{
		Chapters: make([]types.ApiGetChaptersItem, len(chapters)),
	}

	for i, chapter := range chapters {
		result.Chapters[i] = types.ApiGetChaptersItem{
			Id:      chapter.Id,
			Index:   chapter.Index,
			Title:   chapter.Title,
			SerieId: chapter.SerieId,
		}
	}

	return c.JSON(200, types.CreateResponse(result))
}

func (api *ApiConfig) HandleGetChapterById(c echo.Context) error {
	id := c.Param("id")
	chapter, err := api.database.GetChapterById(c.Request().Context(), id)
	if err != nil {
		if pgxscan.NotFound(err) {
			return c.JSON(404, map[string]any{
				"message": "No chapter with id: " + id,
			})
		} else {
			return err
		}
	}

	nextId, err := api.database.GetNextChapter(c.Request().Context(), chapter.SerieId, chapter.Index)
	prevId, err := api.database.GetPrevChapter(c.Request().Context(), chapter.SerieId, chapter.Index)

	pages := strings.Split(chapter.Pages, ",")
	for i, page := range pages {
		pages[i] = ConvertURL(c, fmt.Sprintf("/chapters/%s/%s", chapter.Id, page))
	}

	result := types.ApiGetChapterById{
		Id:            chapter.Id,
		Index:         chapter.Index,
		Title:         chapter.Title,
		SerieId:       chapter.SerieId,
		NextChapterId: nextId,
		PrevChapterId: prevId,
		Pages:         pages,
	}

	return c.JSON(200, types.CreateResponse(result))

}

func (api *ApiConfig) HandlePostChapterMarkById(c echo.Context) error {
	id := c.Param("id")

	authHeader := c.Request().Header.Get("Authorization")
	splits := strings.Split(authHeader, " ")
	if len(splits) != 2 {
		return types.ErrInvalidAuthHeader
	}

	if splits[0] != "Bearer" {
		return types.ErrInvalidAuthHeader
	}

	fmt.Printf("splits[1]: %v\n", splits[1])

	tokenString := splits[1]

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte("SOME SECRET"), nil
	})

	if err != nil {
		return types.ErrInvalidToken
	}

	validator := jwt.NewValidator(jwt.WithExpirationRequired(), jwt.WithIssuedAt())

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if err := validator.Validate(token.Claims); err != nil {
			return types.ErrInvalidToken
		}

		userId := claims["userId"].(string)
		// user, err := api.database.GetUserById(c.Request().Context(), userId)
		// if err != nil {
		// 	return err
		// }

		err := api.database.MarkChapter(c.Request().Context(), userId, id, true)
		if err != nil {
			return err
		}
	}

	return nil
}

func (api *ApiConfig) HandlePostChapterUnmarkById(c echo.Context) error {
	id := c.Param("id")

	authHeader := c.Request().Header.Get("Authorization")
	splits := strings.Split(authHeader, " ")
	if len(splits) != 2 {
		return types.ErrInvalidAuthHeader
	}

	if splits[0] != "Bearer" {
		return types.ErrInvalidAuthHeader
	}

	fmt.Printf("splits[1]: %v\n", splits[1])

	tokenString := splits[1]

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}

		return []byte("SOME SECRET"), nil
	})

	if err != nil {
		return types.ErrInvalidToken
	}

	validator := jwt.NewValidator(jwt.WithExpirationRequired(), jwt.WithIssuedAt())

	if claims, ok := token.Claims.(jwt.MapClaims); ok {
		if err := validator.Validate(token.Claims); err != nil {
			return types.ErrInvalidToken
		}

		userId := claims["userId"].(string)
		// user, err := api.database.GetUserById(c.Request().Context(), userId)
		// if err != nil {
		// 	return err
		// }

		err := api.database.MarkChapter(c.Request().Context(), userId, id, false)
		if err != nil {
			return err
		}
	}

	return nil
}

func InstallChapterHandlers(g *echo.Group, api *ApiConfig) {
	g.GET("/chapters", api.HandleGetChapters)
	g.GET("/chapters/:id", api.HandleGetChapterById)
	g.POST("/chapters/:id/mark", api.HandlePostChapterMarkById)
	g.POST("/chapters/:id/unmark", api.HandlePostChapterUnmarkById)
}
