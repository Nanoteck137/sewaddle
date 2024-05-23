package types

import "github.com/faceair/jio"

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

type GetChapterByIdUser struct {
	IsMarked bool `json:"isMarked"`
}

type PostAuthSignupBody struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}

var PostAuthSignupBodySchema = jio.Object().Keys(jio.K{
	"username":        jio.String().Min(4).Required(),
	"password":        jio.String().Min(8).Required(),
	"passwordConfirm": jio.String().Min(8).Required(),
})

type PostAuthSignup struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

type PostAuthSigninBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

var PostAuthSigninBodySchema = jio.Object().Keys(jio.K{
	"username": jio.String().Required(),
	"password": jio.String().Required(),
})

type PostAuthSignin struct {
	Token string `json:"token"`
}

type GetAuthMe struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	IsOwner  bool   `json:"isOwner"`
}

// TODO(patrik): Remove?
type PostSerieUpdateBody struct {
	SerieId       string `json:"serieId"`
	ChapterNumber int    `json:"chapterNumber"`
}

type PostUserMarkChaptersBody struct {
	SerieId  string `json:"serieId"`
	Chapters []int  `json:"chapters"`
}

var PostUserMarkChaptersBodySchema = jio.Object().Keys(jio.K{
	"serieId":  jio.String().Required(),
	"chapters": jio.Array().Items(jio.Number().Integer()).Min(1).Required(),
})

type PostUserUnmarkChaptersBody struct {
	SerieId  string `json:"serieId"`
	Chapters []int  `json:"chapters"`
}

var PostUserUnmarkChaptersBodySchema = jio.Object().Keys(jio.K{
	"serieId":  jio.String().Required(),
	"chapters": jio.Array().Items(jio.Number().Integer()).Min(1).Required(),
})

type PostUserUpdateBookmarkBody struct {
	SerieId string `json:"serieId"`
	Chapter int    `json:"chapter"`
	Page    int    `json:"page"`
}

var PostUserUpdateBookmarkBodySchema = jio.Object().Keys(jio.K{
	"serieId": jio.String().Required(),
	"chapter": jio.Number().Integer().Required(),
	"page":    jio.Number().Integer().Required(),
})
