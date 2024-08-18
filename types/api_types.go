package types

import "github.com/faceair/jio"

type Body interface {
	Schema() jio.Schema
}

type Serie struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Cover        string `json:"cover"`
	ChapterCount int    `json:"chapterCount"`
}

type Chapter struct {
	SerieId  string           `json:"serieId"`
	Slug     string           `json:"slug"`
	Title    string           `json:"title"`
	CoverArt string           `json:"coverArt"`
	User     *ChapterUserData `json:"user,omitempty"`
}

type Bookmark struct {
	ChapterSlug int `json:"chapterSlug"`
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
	NextChapter *string  `json:"nextChapter"`
	PrevChapter *string  `json:"prevChapter"`
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

func (b PostSystemSetupBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"username":        jio.String().Required(),
		"password":        jio.String().Required(),
		"passwordConfirm": jio.String().Required(),
	})
}

type GetChapterByIdUser struct {
	IsMarked bool `json:"isMarked"`
}

type PostAuthSignupBody struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}

func (b PostAuthSignupBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"username":        jio.String().Min(4).Required(),
		"password":        jio.String().Min(8).Required(),
		"passwordConfirm": jio.String().Min(8).Required(),
	})
}

type PostAuthSignup struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

type PostAuthSigninBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (b PostAuthSigninBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"username": jio.String().Required(),
		"password": jio.String().Required(),
	})
}

type PostAuthSignin struct {
	Token string `json:"token"`
}

type GetAuthMe struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	IsOwner  bool   `json:"isOwner"`
}

type PostUserMarkChaptersBody struct {
	SerieId  string   `json:"serieId"`
	Chapters []string `json:"chapters"`
}

func (b PostUserMarkChaptersBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieId":  jio.String().Required(),
		"chapters": jio.Array().Items(jio.Number().Integer()).Min(1).Required(),
	})
}

type PostUserUnmarkChaptersBody struct {
	SerieId  string   `json:"serieId"`
	Chapters []string `json:"chapters"`
}

func (b PostUserUnmarkChaptersBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieId":  jio.String().Required(),
		"chapters": jio.Array().Items(jio.Number().Integer()).Min(1).Required(),
	})
}

type PostUserUpdateBookmarkBody struct {
	SerieId string `json:"serieId"`
	Chapter int    `json:"chapter"`
	Page    int    `json:"page"`
}

func (b PostUserUpdateBookmarkBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieId": jio.String().Required(),
		"chapter": jio.Number().Integer().Required(),
		"page":    jio.Number().Integer().Required(),
	})
}
