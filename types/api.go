package types

type ApiGetSeriesItem struct {
	Id   string `json:"id"`
	Name string `json:"name"`
	ChapterCount int `json:"chapterCount"`
}

type ApiGetSeries struct {
	Series []ApiGetSeriesItem
}
