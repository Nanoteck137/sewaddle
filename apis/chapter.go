package apis

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
)

func InstallChapterHandlers(app core.App, group pyrin.Group) {
	group.Register(
		pyrin.ApiHandler{
			Name:     "GetChapters",
			Method:   http.MethodGet,
			Path:     "/chapters",
			DataType: types.GetChapters{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				chapters, err := app.DB().GetAllChapters(c.Request().Context())
				if err != nil {
					return nil, err
				}

				res := types.GetChapters{
					Chapters: make([]types.Chapter, len(chapters)),
				}

				for i, chapter := range chapters {
					res.Chapters[i] = types.Chapter{
						SerieSlug: chapter.SerieSlug,
						Slug:      chapter.Slug,
						Title:     chapter.Title,
						Number:    chapter.Number.Int64,
					}
				}

				return res, nil
			},
		},

		pyrin.ApiHandler{
			Name:     "GetChapterBySlug",
			Method:   http.MethodGet,
			Path:     "/chapters/:serieSlug/:slug",
			DataType: types.GetChapterBySlug{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				serieId := c.Param("serieSlug")
				slug := c.Param("slug")

				ctx := context.TODO()

				chapter, err := app.DB().GetChapter(ctx, serieId, slug)
				if err != nil {
					return nil, err
				}

				var nextChapter *string
				var prevChapter *string

				chapters, err := app.DB().GetSerieChaptersById(ctx, chapter.SerieSlug)
				if err != nil {
					return nil, err
				}

				index := -1

				for i, c := range chapters {
					if c.Slug == chapter.Slug {
						index = i
						break
					}
				}

				if index+1 < len(chapters) {
					nextChapter = &chapters[index+1].Slug
				}

				if index-1 >= 0 {
					prevChapter = &chapters[index-1].Slug
				}

				var userData *types.ChapterUserData

				user, err := User(app, c)
				if err == nil {
					isMarked, err := app.DB().IsChapterMarked(c.Request().Context(), user.Id, chapter.SerieSlug, chapter.Slug)
					if err != nil {
						return nil, err
					}

					userData = &types.ChapterUserData{
						IsMarked: isMarked,
					}
				}

				pages := strings.Split(chapter.Pages, ",")
				for i, page := range pages {
					pages[i] = utils.ConvertURL(c, fmt.Sprintf("/files/chapters/%s/%s/%s", chapter.SerieSlug, chapter.Slug, page))
				}

				res := types.GetChapterBySlug{
					Chapter: types.Chapter{
						SerieSlug: chapter.SerieSlug,
						Slug:      chapter.Slug,
						Title:     chapter.Title,
						Number:    chapter.Number.Int64,
						CoverArt:  pages[0],
						User:      userData,
					},
					NextChapter: nextChapter,
					PrevChapter: prevChapter,
					Pages:       pages,
				}

				return res, nil
			},
		},
	)
}
