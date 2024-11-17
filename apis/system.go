package apis

import (
	"context"
	"encoding/json"
	"net/http"
	"os"

	"github.com/kr/pretty"
	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/sewaddle"
	"github.com/nanoteck137/sewaddle/core"
	"github.com/nanoteck137/sewaddle/types"
)

type ExportSerie struct {
	Id   string `json:"id"`
	Name string `json:"name"`

	CoverOriginal string `json:"cover_original"`
	CoverLarge    string `json:"cover_large"`
	CoverMedium   string `json:"cover_medium"`
	CoverSmall    string `json:"cover_small"`

	Created int64 `json:"created"`
	Updated int64 `json:"updated"`
}

type ExportChapter struct {
	Id      string `json:"id"`
	SerieId string `json:"serie_id"`

	Title  string `json:"title"`
	Pages  string `json:"pages"`
	Number int64    `json:"number"`
	Cover  string `json:"cover"`

	Created int64 `json:"created"`
	Updated int64 `json:"updated"`
}

type Export struct {
	Series   []ExportSerie   `json:"series"`
	Chapters []ExportChapter `json:"chapters"`
}

func InstallSystemHandlers(app core.App, group pyrin.Group) {
	group.Register(
		pyrin.ApiHandler{
			Name:     "GetSystemInfo",
			Path:     "/system/info",
			Method:   http.MethodGet,
			DataType: types.GetSystemInfo{},
			HandlerFunc: func(c pyrin.Context) (any, error) {
				return types.GetSystemInfo{
					Version: sewaddle.Version,
				}, nil
			},
		},
		pyrin.ApiHandler{
			Name:   "Export",
			Path:   "/system/export",
			Method: http.MethodPost,
			HandlerFunc: func(c pyrin.Context) (any, error) {
				db := app.DB()

				ctx := context.TODO()

				export := Export{}

				series, err := db.GetAllSeries(ctx)
				if err != nil {
					return nil, err
				}

				export.Series = make([]ExportSerie, len(series))
				for i, serie := range series {
					export.Series[i] = ExportSerie{
						Id:            serie.Id,
						Name:          serie.Name,
						CoverOriginal: serie.CoverOriginal.String,
						CoverLarge:    serie.CoverLarge.String,
						CoverMedium:   serie.CoverMedium.String,
						CoverSmall:    serie.CoverSmall.String,
						Created:       serie.Created,
						Updated:       serie.Updated,
					}
				}

				chapters, err := db.GetAllChapters(ctx)
				if err != nil {
					return nil, err
				}

				export.Chapters = make([]ExportChapter, len(chapters))
				for i, chapter  := range chapters {
					num := chapter.Number.Int64
					if !chapter.Number.Valid {
						num = -1
					}

					export.Chapters[i] = ExportChapter{
						Id:      chapter.Id,
						SerieId: chapter.SerieId,
						Title:   chapter.Title,
						Pages:   chapter.Pages,
						Number:  num,
						Cover:   chapter.Cover.String,
						Created: chapter.Created,
						Updated: chapter.Updated,
					}
				}

				pretty.Println(export)

				d, err := json.MarshalIndent(export, "", "  ")
				if err != nil {
					return nil, err
				}

				err = os.WriteFile(app.WorkDir().ExportFile(), d, 0644)
				if err != nil {
					return nil, err
				}

				return nil, nil
			},
		},
	)
}
