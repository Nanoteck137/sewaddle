package apis

import (
	"errors"
	"net/http"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
)

func InstallUserHandlers(app core.App, group pyrin.Group) {
	group.Register(
		pyrin.ApiHandler{
			Name:     "MarkChapters",
			Method:   http.MethodPost,
			Path:     "/user/markChapters",
			BodyType: types.PostUserMarkChaptersBody{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				user, err := User(app, c)
				if err != nil {
					return nil, err
				}

				body, err := Body[types.PostUserMarkChaptersBody](c)
				if err != nil {
					return nil, err
				}

				for _, chapter := range body.Chapters {
					err := app.DB().MarkChapter(c.Request().Context(), user.Id, chapter)
					if err != nil && !errors.Is(err, database.ErrAlreadyMarked) {
						return nil, err
					}
				}

				return nil, nil
			},
		},

		pyrin.ApiHandler{
			Name:     "UnmarkChapters",
			Method:   http.MethodPost,
			Path:     "/user/unmarkChapters",
			DataType: nil,
			BodyType: types.PostUserUnmarkChaptersBody{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				user, err := User(app, c)
				if err != nil {
					return nil, err
				}

				body, err := Body[types.PostUserUnmarkChaptersBody](c)
				if err != nil {
					return nil, err
				}

				for _, chapter := range body.Chapters {
					err := app.DB().UnmarkChapter(c.Request().Context(), user.Id, chapter)
					if err != nil {
						return nil, err
					}
				}

				return nil, nil
			},
		},

		pyrin.ApiHandler{
			Name:     "UpdateBookmark",
			Method:   http.MethodPost,
			Path:     "/user/updateBookmark",
			DataType: nil,
			BodyType: types.PostUserUpdateBookmarkBody{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				user, err := User(app, c)
				if err != nil {
					return nil, err
				}

				body, err := Body[types.PostUserUpdateBookmarkBody](c)
				if err != nil {
					return nil, err
				}

				ctx := c.Request().Context()

				serie, err := app.DB().GetSerieById(ctx, body.SerieId)
				if err != nil {
					return nil, err
				}

				chapter, err := app.DB().GetChapter(ctx, body.ChapterId)
				if err != nil {
					return nil, err
				}

				hasBookmark, err := app.DB().HasBookmark(ctx, user.Id, serie.Id)
				if err != nil {
					return nil, err
				}

				if hasBookmark {
					err := app.DB().UpdateBookmark(ctx, user.Id, serie.Id, chapter.Id)
					if err != nil {
						return nil, err
					}
				} else {
					err := app.DB().CreateBookmark(ctx, user.Id, serie.Id, chapter.Id)
					if err != nil {
						return nil, err
					}
				}

				return nil, nil
			},
		},
	)
}
