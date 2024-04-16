// THIS FILE IS GENERATED BY PYRIN GOGEN CODE GENERATOR
package types

type Serie struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Cover        string `json:"cover"`
	ChapterCount int    `json:"chapterCount"`
}

type Chapter struct {
	Id      string `json:"id"`
	Index   int    `json:"index"`
	Title   string `json:"title"`
	SerieId string `json:"serieId"`
}

type ChapterUserData struct {
	IsMarked bool `json:"isMarked"`
}

type GetSeries struct {
	Series []Serie `json:"series"`
}

type GetSerieById Serie

type GetSerieChaptersById struct {
	Chapters []Chapter `json:"chapters"`
}

type GetChapters struct {
	Chapters []Chapter `json:"chapters"`
}

type GetChapterById struct {
	Id            string           `json:"id"`
	Index         int              `json:"index"`
	Title         string           `json:"title"`
	SerieId       string           `json:"serieId"`
	NextChapterId string           `json:"nextChapterId"`
	PrevChapterId string           `json:"prevChapterId"`
	Pages         []string         `json:"pages"`
	User          *ChapterUserData `json:"user,omitempty"`
}
