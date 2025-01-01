package types

type Serie struct {
	Id            string `json:"id"`
	Name          string `json:"name"`
	CoverOriginal string `json:"coverOriginal"`
	CoverLarge    string `json:"coverLarge"`
	CoverMedium   string `json:"coverMedium"`
	CoverSmall    string `json:"coverSmall"`
	ChapterCount  int64  `json:"chapterCount"`
}

type ChapterUserData struct {
	IsMarked bool `json:"isMarked"`
}

type GetLibraryStatus struct {
	Syncing bool `json:"syncing"`
}

type GetSystemInfo struct {
	Version string `json:"version"`
}

// TODO(patrik): Validate and transform
type PostSystemSetupBody struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}

type GetChapterByIdUser struct {
	IsMarked bool `json:"isMarked"`
}

// TODO(patrik): Validate and transform
type PostAuthSignupBody struct {
	Username        string `json:"username"`
	Password        string `json:"password"`
	PasswordConfirm string `json:"passwordConfirm"`
}

type PostAuthSignup struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

// TODO(patrik): Validate and transform
type PostAuthSigninBody struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type PostAuthSignin struct {
	Token string `json:"token"`
}

type GetAuthMe struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	IsOwner  bool   `json:"isOwner"`
}

// TODO(patrik): Validate and transform
type PostUserMarkChaptersBody struct {
	Chapters []string `json:"chapters"`
}

// TODO(patrik): Validate and transform
type PostUserUnmarkChaptersBody struct {
	Chapters []string `json:"chapters"`
}

// TODO(patrik): Validate and transform
type PostUserUpdateBookmarkBody struct {
	SerieId   string `json:"serieId"`
	ChapterId string `json:"chapterId"`
	Page      int    `json:"page"`
}
