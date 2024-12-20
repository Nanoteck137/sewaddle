package apis

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

func ConvertSerieImage(c pyrin.Context, serieId string, image sql.NullString) string {
	res := "/files/images/default/default_cover.png"
	if image.Valid {
		res = "/files/series/" + serieId + "/" + image.String
	}

	return utils.ConvertURL(c, res)
}

func ConvertDBSerie(c pyrin.Context, serie database.Serie) types.Serie {
	return types.Serie{
		Id:            serie.Id,
		Name:          serie.Name,
		CoverOriginal: ConvertSerieImage(c, serie.Id, serie.CoverOriginal),
		CoverLarge:    ConvertSerieImage(c, serie.Id, serie.CoverLarge),
		CoverMedium:   ConvertSerieImage(c, serie.Id, serie.CoverMedium),
		CoverSmall:    ConvertSerieImage(c, serie.Id, serie.CoverSmall),
		ChapterCount:  serie.ChapterCount,
	}
}

func InstallSerieHandlers(app core.App, group pyrin.Group) {
	group.Register(
		pyrin.ApiHandler{
			Name:     "GetSeries",
			Method:   http.MethodGet,
			Path:     "/series",
			DataType: types.GetSeries{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				items, err := app.DB().GetAllSeries(c.Request().Context())
				if err != nil {
					return nil, err
				}

				res := types.GetSeries{
					Series: make([]types.Serie, len(items)),
				}

				for i, item := range items {
					res.Series[i] = ConvertDBSerie(c, item)
				}

				return res, nil
			},
		},

		pyrin.ApiHandler{
			Name:     "GetSerieById",
			Method:   http.MethodGet,
			Path:     "/series/:id",
			DataType: types.GetSerieById{},
			Errors:   []pyrin.ErrorType{TypeSerieNotFound},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				id := c.Param("id")
				serie, err := app.DB().GetSerieById(c.Request().Context(), id)
				if err != nil {
					if errors.Is(err, database.ErrItemNotFound) {
						return nil, SerieNotFound()
					}

					return nil, err
				}

				var userData *types.SerieUserData

				user, err := User(app, c)
				if user != nil {
					dbBookmark, err := app.DB().GetBookmark(c.Request().Context(), user.Id, serie.Id)
					if err != nil && err != database.ErrItemNotFound {
						return nil, err
					}

					var bookmark *types.Bookmark
					if err != database.ErrItemNotFound {
						bookmark = &types.Bookmark{
							ChapterId: dbBookmark.ChapterId,
						}
					}

					userData = &types.SerieUserData{
						Bookmark: bookmark,
					}
				}

				res := types.GetSerieById{
					Serie: ConvertDBSerie(c, serie),
					User:  userData,
				}

				return res, nil
			},
		},

		pyrin.ApiHandler{
			Name:     "GetSerieChapters",
			Method:   http.MethodGet,
			Path:     "/series/:id/chapters",
			DataType: types.GetSerieChaptersById{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				id := c.Param("id")

				items, err := app.DB().GetSerieChaptersById(c.Request().Context(), id)
				if err != nil {
					return nil, err
				}

				res := types.GetSerieChaptersById{
					Chapters: make([]types.Chapter, len(items)),
				}

				var markedChapters []string

				user, _ := User(app, c)
				if user != nil {
					markedChapters, err = app.DB().GetAllMarkedChapters(c.Request().Context(), user.Id, id)
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

				for i, item := range items {
					var userData *types.ChapterUserData
					if user != nil {
						isMarked := isChapterMarked(item.Id)

						userData = &types.ChapterUserData{
							IsMarked: isMarked,
						}
					}

					ch := ConvertDBChapter(c, item)
					ch.User = userData
					res.Chapters[i] = ch 
				}

				return res, nil
			},
		},
	)
}
