package types

import (
	"github.com/faceair/jio"
	"github.com/nanoteck137/pyrin"
	"github.com/nanoteck137/pyrin/tools/validate"
)

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

var _ pyrin.Body = (*PostAuthSignupBody)(nil)

type PostAuthSignupBody struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}

func (b PostAuthSignupBody) Validate(validator validate.Validator) error {
	panic("unimplemented")
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

var _ pyrin.Body = (*PostAuthSigninBody)(nil)

type PostAuthSigninBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func (b PostAuthSigninBody) Validate(validator validate.Validator) error {
	panic("unimplemented")
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

var _ pyrin.Body = (*PostUserMarkChaptersBody)(nil)

type PostUserMarkChaptersBody struct {
	SerieSlug string   `json:"serieSlug"`
	Chapters  []string `json:"chapters"`
}

func (b PostUserMarkChaptersBody) Validate(validator validate.Validator) error {
	panic("unimplemented")
}

func (b PostUserMarkChaptersBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieSlug": jio.String().Required(),
		"chapters":  jio.Array().Items(jio.String()).Min(1).Required(),
	})
}

var _ pyrin.Body = (*PostUserUnmarkChaptersBody)(nil)

type PostUserUnmarkChaptersBody struct {
	SerieSlug string   `json:"serieSlug"`
	Chapters  []string `json:"chapters"`
}

func (b PostUserUnmarkChaptersBody) Validate(validator validate.Validator) error {
	panic("unimplemented")
}

func (b PostUserUnmarkChaptersBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieSlug": jio.String().Required(),
		"chapters":  jio.Array().Items(jio.String()).Min(1).Required(),
	})
}

var _ pyrin.Body = (*PostUserUpdateBookmarkBody)(nil)

type PostUserUpdateBookmarkBody struct {
	SerieSlug   string `json:"serieSlug"`
	ChapterSlug string `json:"chapterSlug"`
	Page        int    `json:"page"`
}

func (b PostUserUpdateBookmarkBody) Validate(validator validate.Validator) error {
	panic("unimplemented")
}

func (b PostUserUpdateBookmarkBody) Schema() jio.Schema {
	return jio.Object().Keys(jio.K{
		"serieSlug":   jio.String().Required(),
		"chapterSlug": jio.String().Required(),
		"page":        jio.Number().Integer().Required(),
	})
}
