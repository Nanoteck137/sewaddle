package apis

import (
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

				chapter, err := app.DB().GetChapter(c.Request().Context(), serieId, slug)
				if err != nil {
					return nil, err
				}

				nextChapterSlug, err := app.DB().GetNextChapter(c.Request().Context(), chapter.SerieSlug, chapter.Number)
				if err != nil {
					return nil, err
				}

				var nextChapter *string
				if nextChapterSlug != "" {
					nextChapter = &nextChapterSlug
				}

				prevChapterSlug, err := app.DB().GetPrevChapter(c.Request().Context(), chapter.SerieSlug, chapter.Number)
				if err != nil {
					return nil, err
				}

				var prevChapter *string
				if prevChapterSlug != "" {
					prevChapter = &prevChapterSlug
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
