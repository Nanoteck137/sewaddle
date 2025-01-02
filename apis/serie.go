package apis

import (
	"context"
	"database/sql"
	"errors"
	"io"
	"net/http"
	"os"
	"path"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/pyrin/tools/transform"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
	"github.com/nanoteck137/validate"
)

type Serie struct {
	Id   string `json:"id"`
	Name string `json:"name"`

	CoverArt types.Images `json:"coverArt"`

	MalId     *string `json:"malId"`
	AnilistId *string `json:"anilistId"`
}

func ConvertSerieImage(c pyrin.Context, serieId string, val sql.NullString) types.Images {
	if val.Valid && val.String != "" {
		first := "/files/series/" + serieId + "/"
		return types.Images{
			Small:  utils.ConvertURL(c, first+"cover-128.png"),
			Medium: utils.ConvertURL(c, first+"cover-256.png"),
			Large:  utils.ConvertURL(c, first+"cover-512.png"),
		}
	}

	url := utils.ConvertURL(c, "/files/images/default/default_cover.png")
	return types.Images{
		Small:  url,
		Medium: url,
		Large:  url,
	}
}

func ConvertDBSerie(c pyrin.Context, serie database.Serie) Serie {
	return Serie{
		Id:        serie.Id,
		Name:      serie.Name,
		CoverArt:  ConvertSerieImage(c, serie.Id, serie.CoverArt),
		MalId:     ConvertSqlNullString(serie.MalId),
		AnilistId: ConvertSqlNullString(serie.AnilistId),
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
				q := c.Request().URL.Query()

				nameFilter := q.Get("nameFilter")

				ctx := context.TODO()
				series, err := app.DB().GetAllSeries(ctx, nameFilter)
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

				for i, chapter := range chapters {
					var userData *ChapterUserData
					if user != nil {
						isMarked := isChapterMarked(chapter.Id)

						userData = &ChapterUserData{
							IsMarked: isMarked,
						}
					}

					ch := ConvertDBChapter(c, chapter)
					ch.User = userData
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
					Id:   id,
					Name: body.Name,
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

		pyrin.FormApiHandler{
			Name:   "ChangeSerieCover",
			Method: http.MethodPost,
			Path:   "/series/:id/cover",
			Spec: pyrin.FormSpec{
				Files: map[string]pyrin.FormFileSpec{
					"cover": {
						NumExpected: 1,
					},
				},
			},
			Errors: []pyrin.ErrorType{ErrTypeSerieNotFound},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				id := c.Param("id")

				ctx := context.TODO()

				serie, err := app.DB().GetSerieById(ctx, id)
				if err != nil {
					return nil, SerieNotFound()
				}

				artistDir := app.WorkDir().SerieDir(serie.Id)

				files, err := pyrin.FormFiles(c, "cover")
				if err != nil {
					return nil, err
				}

				file := files[0]

				src, err := file.Open()
				if err != nil {
					return nil, err
				}
				defer src.Close()

				name := "cover-original" + path.Ext(file.Filename)
				dstName := path.Join(artistDir, name)
				dst, err := os.OpenFile(dstName, os.O_RDWR|os.O_CREATE|os.O_TRUNC, 0644)
				if err != nil {
					return nil, err
				}
				defer dst.Close()

				_, err = io.Copy(dst, src)
				if err != nil {
					return nil, err
				}

				dst.Close()

				i := path.Join(artistDir, "cover-128.png")
				err = utils.CreateResizedImage(dstName, i, 128, 165)
				if err != nil {
					return nil, err
				}

				i = path.Join(artistDir, "cover-256.png")
				err = utils.CreateResizedImage(dstName, i, 256, 329)
				if err != nil {
					return nil, err
				}

				i = path.Join(artistDir, "cover-512.png")
				err = utils.CreateResizedImage(dstName, i, 512, 658)
				if err != nil {
					return nil, err
				}

				err = app.DB().UpdateSerie(ctx, serie.Id, database.SerieChanges{
					CoverArt: types.Change[sql.NullString]{
						Value: sql.NullString{
							String: name,
							Valid:  true,
						},
						Changed: true,
					},
				})
				if err != nil {
					return nil, err
				}

				return nil, nil
			},
		},

		pyrin.ApiHandler{
			Name:         "DeleteSerie",
			Method:       http.MethodDelete,
			Path:         "/series/:id",
			Errors:       []pyrin.ErrorType{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				// TODO(patrik): Move the series files to a trash can system
				id := c.Param("id")

				db, tx, err := app.DB().Begin()
				if err != nil {
					return nil, err
				}
				defer tx.Rollback()

				ctx := context.TODO()

				// TODO(patrik): Check for serie 

				chapters, err := db.GetSerieChapters(ctx, id)
				if err != nil {
					return nil, err
				}

				for _, chapter := range chapters {
					// TODO(patrik): Move chapter files to trash can
					err = db.RemoveChapter(ctx, chapter.Id)
					if err != nil {
						return nil, err
					}
				}

				err = db.DeleteSerie(ctx, id)
				if err != nil {
					return nil, err
				}

				err = tx.Commit()
				if err != nil {
					return nil, err
				}

				return nil, nil
			},
		},
	)
}
