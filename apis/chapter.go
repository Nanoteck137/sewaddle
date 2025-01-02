package apis

import (
	"context"
	"database/sql"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path"
	"sort"
	"strconv"
	"strings"

	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/pyrin/tools/transform"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nanoteck137/sewaddle/utils"
	"github.com/nanoteck137/validate"
)

type ChapterUserData struct {
	IsMarked bool `json:"isMarked"`
}

type Chapter struct {
	Id   string `json:"id"`
	Name string `json:"name"`

	SerieId string `json:"serieId"`

	Pages    []string     `json:"pages"`
	CoverArt types.Images `json:"coverArt"`

	User *ChapterUserData `json:"user,omitempty"`
}

func CreateChapterCoverImage(c pyrin.Context, chapterId string) types.Images {
	return types.Images{
		Small:  utils.ConvertURL(c, "/files/chapters/"+chapterId+"/cover-small.png"),
		Medium: utils.ConvertURL(c, "/files/chapters/"+chapterId+"/cover-medium.png"),
		Large:  utils.ConvertURL(c, "/files/chapters/"+chapterId+"/cover-large.png"),
	}
}

func ConvertChapterImage(c pyrin.Context, chapterId string, image sql.NullString) string {
	res := "/files/images/default/default_cover.png"
	if image.Valid {
		res = "/files/chapters/" + chapterId + "/" + image.String
	}

	return utils.ConvertURL(c, res)
}

func ConvertDBChapter(c pyrin.Context, chapter database.Chapter) Chapter {
	pages := strings.Split(chapter.Pages, ",")

	for i, p := range pages {
		pages[i] = utils.ConvertURL(c, "/files/chapters/"+chapter.Id+"/"+p)
	}

	return Chapter{
		Id:       chapter.Id,
		Name:     chapter.Name,
		SerieId:  chapter.SerieId,
		Pages:    pages,
		CoverArt: CreateChapterCoverImage(c, chapter.Id),
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

type UploadChapterBody struct {
	Name    string `json:"name"`
	SerieId string `json:"serieId"`
}

func (b *UploadChapterBody) Transform() {
	b.Name = transform.String(b.Name)
}

func (b UploadChapterBody) Validate() error {
	return validate.ValidateStruct(&b,
		validate.Field(&b.Name, validate.Required),
	)
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

		pyrin.FormApiHandler{
			Name:   "UploadChapter",
			Method: http.MethodPost,
			Path:   "/chapters",
			Spec: pyrin.FormSpec{
				BodyType: UploadChapterBody{},
				Files: map[string]pyrin.FormFileSpec{
					"pages": {
						NumExpected: 1,
					},
				},
			},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				body, err := pyrin.Body[UploadChapterBody](c)
				if err != nil {
					return nil, err
				}

				db, tx, err := app.DB().Begin()
				if err != nil {
					return nil, err
				}
				defer tx.Rollback()

				ctx := context.TODO()

				pages, err := pyrin.FormFiles(c, "pages")
				if err != nil {
					return nil, err
				}

				id := utils.CreateChapterId()

				chapterDir := app.WorkDir().ChapterDir(id)
				err = os.Mkdir(chapterDir, 0755)
				if err != nil {
					return nil, err
				}

				copyFormFileToDest := func(fileHeader *multipart.FileHeader, dstName string) error {
					src, err := fileHeader.Open()
					if err != nil {
						return err
					}

					dst, err := os.OpenFile(dstName, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0644)
					if err != nil {
						return err
					}

					_, err = io.Copy(dst, src)
					if err != nil {
						return err
					}

					return nil
				}

				type File struct {
					Index int
					File  *multipart.FileHeader
				}

				var sortedFiles []File

				var pageNames []string

				for _, p := range pages {
					num := utils.ExtractNumber(p.Filename)
					sortedFiles = append(sortedFiles, File{
						Index: num,
						File:  p,
					})
				}

				sort.Slice(sortedFiles, func(i, j int) bool {
					return sortedFiles[i].Index < sortedFiles[j].Index
				})

				for _, f := range sortedFiles {
					p := f.File

					// TODO(patrik): Check filename ext and content-type
					name := strconv.Itoa(f.Index) + path.Ext(p.Filename)
					dst := path.Join(chapterDir, name)

					err = copyFormFileToDest(p, dst)
					if err != nil {
						return nil, err
					}

					pageNames = append(pageNames, name)
				}

				cover := path.Join(chapterDir, pageNames[0])

				dst := path.Join(chapterDir, "cover-small.png")
				err = utils.CreateResizedImage(cover, dst, 128, 228)
				if err != nil {
					return nil, err
				}

				dst = path.Join(chapterDir, "cover-medium.png")
				err = utils.CreateResizedImage(cover, dst, 256, 455)
				if err != nil {
					return nil, err
				}

				dst = path.Join(chapterDir, "cover-large.png")
				err = utils.CreateResizedImage(cover, dst, 512, 910)
				if err != nil {
					return nil, err
				}

				// TODO(patrik): Check serieId

				chapter, err := db.CreateChapter(ctx, database.CreateChapterParams{
					Id:      id,
					Name:    body.Name,
					SerieId: body.SerieId,
					Pages:   strings.Join(pageNames, ","),
				})
				if err != nil {
					return nil, err
				}

				err = tx.Commit()
				if err != nil {
					return nil, err
				}

				err = app.DB().RecalculateNumberForSerie(ctx, chapter.SerieId)
				if err != nil {
					return nil, err
				}

				return nil, nil
			},
		},

		pyrin.ApiHandler{
			Name:         "RemoveChapter",
			Method:       http.MethodDelete,
			Path:         "/chapters/:id",
			Errors:       []pyrin.ErrorType{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				// TODO(patrik): Move the chapter files to a trash can system
				id := c.Param("id")

				db, tx, err := app.DB().Begin()
				if err != nil {
					return nil, err
				}
				defer tx.Rollback()

				ctx := context.TODO()
				err = db.RemoveChapter(ctx, id)
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
