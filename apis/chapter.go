package apis

import (
	"context"
	"database/sql"
	"net/http"
	"strings"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/utils"
)

type ChapterUserData struct {
	IsMarked bool `json:"isMarked"`
}

type Chapter struct {
	Id   string `json:"id"`
	Name string `json:"name"`

	SerieId string `json:"serieId"`

	Pages    []string `json:"pages"`
	Number   int64    `json:"number"`
	CoverArt string   `json:"coverArt"`
}

func ConvertChapterImage(c pyrin.Context, chapterId string, image sql.NullString) string {
	res := "/files/images/default/default_cover.png"
	if image.Valid {
		res = "/files/chapters/" + chapterId + "/" + image.String
	}

	return utils.ConvertURL(c, res)
}

func ConvertDBChapter(c pyrin.Context, chapter database.Chapter) Chapter {
	return Chapter{
		Id:       chapter.Id,
		Name:     chapter.Name,
		SerieId:  chapter.SerieId,
		Pages:    strings.Split(chapter.Pages, ","),
		Number:   chapter.Number,
		CoverArt: ConvertChapterImage(c, chapter.Id, chapter.CoverArt),
	}
}

type GetChapters struct {
	Chapters []Chapter `json:"chapters"`
}

type GetChapterById struct {
	Chapter

	NextChapter *string `json:"nextChapter"`
	PrevChapter *string `json:"prevChapter"`
}

func InstallChapterHandlers(app core.App, group pyrin.Group) {
	group.Register(
		pyrin.ApiHandler{
			Name:         "GetChapters",
			Method:       http.MethodGet,
			Path:         "/chapters",
			ResponseType: GetChapters{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				chapters, err := app.DB().GetAllChapters(c.Request().Context())
				if err != nil {
					return nil, err
				}

				res := GetChapters{
					Chapters: make([]Chapter, len(chapters)),
				}

				for i, chapter := range chapters {
					res.Chapters[i] = ConvertDBChapter(c, chapter)
				}

				return res, nil
			},
		},

		pyrin.ApiHandler{
			Name:         "GetChapterById",
			Method:       http.MethodGet,
			Path:         "/chapters/:id",
			ResponseType: GetChapterById{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				id := c.Param("id")

				ctx := context.TODO()

				chapter, err := app.DB().GetChapterById(ctx, id)
				if err != nil {
					return nil, err
				}

				var nextChapter *string
				var prevChapter *string

				chapters, err := app.DB().GetSerieChapters(ctx, chapter.SerieId)
				if err != nil {
					return nil, err
				}

				index := -1

				for i, c := range chapters {
					if c.Id == chapter.Id {
						index = i
						break
					}
				}

				if index+1 < len(chapters) {
					nextChapter = &chapters[index+1].Id
				}

				if index-1 >= 0 {
					prevChapter = &chapters[index-1].Id
				}

				var userData *ChapterUserData
				_ = userData

				user, err := User(app, c)
				if err == nil {
					isMarked, err := app.DB().IsChapterMarked(c.Request().Context(), user.Id, chapter.Id)
					if err != nil {
						return nil, err
					}

					userData = &ChapterUserData{
						IsMarked: isMarked,
					}
				}

				pages := strings.Split(chapter.Pages, ",")
				for i, page := range pages {
					pages[i] = ConvertChapterImage(c, chapter.Id, sql.NullString{
						String: page,
						Valid:  true,
					})
				}

				ch := ConvertDBChapter(c, chapter)
				// ch.User = userData

				return GetChapterById{
					Chapter:     ch,
					NextChapter: nextChapter,
					PrevChapter: prevChapter,
				}, nil
			},
		},
	)
}
