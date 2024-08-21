package types

import "github.com/faceair/jio"

type Body interface {
	Schema() jio.Schema
}

type Serie struct {
	Slug         string `json:"slug"`
	Name         string `json:"name"`
	Cover        string `json:"cover"`
	ChapterCount int    `json:"chapterCount"`
}

type Chapter struct {
	SerieSlug string           `json:"serieSlug"`
	Slug      string           `json:"slug"`
	Title     string           `json:"title"`
	CoverArt  string           `json:"coverArt"`
	User      *ChapterUserData `json:"user,omitempty"`
}

type Bookmark struct {
	ChapterSlug string `json:"chapterSlug"`
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

type GetSerieBySlug struct {
	Serie
	User *SerieUserData `json:"user,omitempty"`
}

type GetSerieChaptersBySlug struct {
	Chapters []Chapter `json:"chapters"`
}

type GetChapters struct {
	Chapters []Chapter `json:"chapters"`
}

type GetChapterBySlug struct {
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
	SerieSlug string   `json:"serieSlug"`
	Chapters  []string `json:"chapters"`
}

func (b PostUserMarkChaptersBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieSlug": jio.String().Required(),
		"chapters":  jio.Array().Items(jio.String()).Min(1).Required(),
	})
}

type PostUserUnmarkChaptersBody struct {
	SerieSlug string   `json:"serieSlug"`
	Chapters  []string `json:"chapters"`
}

func (b PostUserUnmarkChaptersBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieSlug": jio.String().Required(),
		"chapters":  jio.Array().Items(jio.String()).Min(1).Required(),
	})
}

type PostUserUpdateBookmarkBody struct {
	SerieSlug   string `json:"serieSlug"`
	ChapterSlug string `json:"chapterSlug"`
	Page        int    `json:"page"`
}

func (b PostUserUpdateBookmarkBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieSlug":   jio.String().Required(),
		"chapterSlug": jio.String().Required(),
		"page":        jio.Number().Integer().Required(),
	})
}
