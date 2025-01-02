package apis

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"os"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/pyrin/tools/transform"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/utils"
	"github.com/nanoteck137/validate"
)

type Serie struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func ConvertSerieImage(c pyrin.Context, serieId string, image sql.NullString) string {
	res := "/files/images/default/default_cover.png"
	if image.Valid {
		res = "/files/series/" + serieId + "/" + image.String
	}

	return utils.ConvertURL(c, res)
}

func ConvertDBSerie(c pyrin.Context, serie database.Serie) Serie {
	return Serie{
		Id:   serie.Id,
		Name: serie.Name,
	}
}

type Bookmark struct {
	ChapterId string `json:"chapterId"`
}

type GetSeries struct {
	Series []Serie `json:"series"`
}

type SerieUserData struct {
	Bookmark *Bookmark `json:"bookmark,omitempty"`
}

type GetSerieById struct {
	Serie
	User *SerieUserData `json:"user,omitempty"`
}

type GetSerieChapters struct {
	Chapters []Chapter `json:"chapters"`
}

type CreateSerie struct {
	SerieId string `json:"serieId"`
}

type CreateSerieBody struct {
	Name string `json:"name"`
}

func (b *CreateSerieBody) Transform() {
	b.Name = transform.String(b.Name)
}

func (b CreateSerieBody) Validate() error {
	return validate.ValidateStruct(&b,
		validate.Field(&b.Name, validate.Required),
	)
}

func InstallSerieHandlers(app core.App, group pyrin.Group) {
	group.Register(
		pyrin.ApiHandler{
			Name:         "GetSeries",
			Method:       http.MethodGet,
			Path:         "/series",
			ResponseType: GetSeries{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				series, err := app.DB().GetAllSeries(c.Request().Context())
				if err != nil {
					return nil, err
				}

				res := GetSeries{
					Series: make([]Serie, len(series)),
				}

				for i, item := range series {
					res.Series[i] = ConvertDBSerie(c, item)
				}

				return res, nil
			},
		},

		pyrin.ApiHandler{
			Name:         "GetSerieById",
			Method:       http.MethodGet,
			Path:         "/series/:id",
			ResponseType: GetSerieById{},
			Errors:       []pyrin.ErrorType{ErrTypeSerieNotFound},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				id := c.Param("id")
				serie, err := app.DB().GetSerieById(c.Request().Context(), id)
				if err != nil {
					if errors.Is(err, database.ErrItemNotFound) {
						return nil, SerieNotFound()
					}

					return nil, err
				}

				var userData *SerieUserData

				user, err := User(app, c)
				if user != nil {
					dbBookmark, err := app.DB().GetBookmark(c.Request().Context(), user.Id, serie.Id)
					if err != nil && err != database.ErrItemNotFound {
						return nil, err
					}

					var bookmark *Bookmark
					if err != database.ErrItemNotFound {
						bookmark = &Bookmark{
							ChapterId: dbBookmark.ChapterId,
						}
					}

					userData = &SerieUserData{
						Bookmark: bookmark,
					}
				}

				res := GetSerieById{
					Serie: ConvertDBSerie(c, serie),
					User:  userData,
				}

				return res, nil
			},
		},

		pyrin.ApiHandler{
			Name:         "GetSerieChapters",
			Method:       http.MethodGet,
			Path:         "/series/:id/chapters",
			ResponseType: GetSerieChapters{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				id := c.Param("id")

				ctx := context.TODO()

				chapters, err := app.DB().GetSerieChapters(ctx, id)
				if err != nil {
					return nil, err
				}

				res := GetSerieChapters{
					Chapters: make([]Chapter, len(chapters)),
				}

				var markedChapters []string

				user, _ := User(app, c)
				if user != nil {
					markedChapters, err = app.DB().GetAllMarkedChapters(ctx, user.Id, id)
					if err != nil {
						return nil, err
					}
				}

				isChapterMarked := func(chapterId string) bool {
					if markedChapters == nil {
						return false
					}

					for _, item := range markedChapters {
						if item == chapterId {
							return true
						}
					}

					return false
				}

				_ = isChapterMarked

				for i, chapter := range chapters {
					// var userData *types.ChapterUserData
					// if user != nil {
					// 	isMarked := isChapterMarked(item.Id)
					//
					// 	userData = &types.ChapterUserData{
					// 		IsMarked: isMarked,
					// 	}
					// }

					ch := ConvertDBChapter(c, chapter)
					// ch.User = userData
					res.Chapters[i] = ch
				}

				return res, nil
			},
		},

		pyrin.ApiHandler{
			Name:         "CreateSerie",
			Method:       http.MethodPost,
			Path:         "/series",
			ResponseType: CreateSerie{},
			BodyType:     CreateSerieBody{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				body, err := pyrin.Body[CreateSerieBody](c)
				if err != nil {
					return nil, err
				}

				id := utils.CreateSerieId()

				ctx := context.TODO()
				_, err = app.DB().CreateSerie(ctx, database.CreateSerieParams{
					Id:       id,
					Name:     body.Name,
				})
				if err != nil {
					return nil, err
				}

				serieDir := app.WorkDir().SerieDir(id)
				err = os.Mkdir(serieDir, 0755)
				if err != nil {
					return nil, err
				}

				return CreateSerie{
					SerieId: id,
				}, nil
			},
		},
	)
}
