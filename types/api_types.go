package types

type Serie struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Cover        string `json:"cover"`
	ChapterCount int    `json:"chapterCount"`
}

type Chapter struct {
	SerieId  string           `json:"serieId"`
	Number   int              `json:"number"`
	Title    string           `json:"title"`
	CoverArt string           `json:"coverArt"`
	User     *ChapterUserData `json:"user,omitempty"`
}

type Bookmark struct {
	ChapterNumber int `json:"chapterNumber"`
	Page          int `json:"page"`
}

type SerieUserData struct {
	Bookmark *Bookmark `json:"bookmark,omitempty"`
}

type ChapterUserData struct {
	IsMarked bool `json:"isMarked"`
}

type GetSeries struct {
	Series []Serie `json:"series"`
}

type GetSerieById struct {
	Serie
	User *SerieUserData `json:"user,omitempty"`
}

type GetSerieChaptersById struct {
	Chapters []Chapter `json:"chapters"`
}

type GetChapters struct {
	Chapters []Chapter `json:"chapters"`
}

type GetChapterById struct {
	Chapter
	NextChapter *int     `json:"nextChapter"`
	PrevChapter *int     `json:"prevChapter"`
	Pages       []string `json:"pages"`
}

type GetLibraryStatus struct {
	Syncing bool `json:"syncing"`
}

type GetSystemInfo struct {
	Version string `json:"version"`
	IsSetup bool   `json:"isSetup"`
}

type PostSystemSetupBody struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}
