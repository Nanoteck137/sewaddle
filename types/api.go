package types

type ApiResponse[T any] struct {
	Message string `json:"message,omitempty"`
	Data    T      `json:"data,omitempty"`
}

func CreateResponseWithMessage[T any](message string, data ...T) ApiResponse[T] {
	var d T

	if data != nil && len(data) > 0 {
		d = data[0]
	}

	return ApiResponse[T]{
		Message: message,
		Data:    d,
	}
}

func CreateResponse[T any](data ...T) ApiResponse[T] {
	var d T

	if data != nil && len(data) > 0 {
		d = data[0]
	}

	return ApiResponse[T]{
		Message: "",
		Data:    d,
	}
}

type ApiGetSeriesItem struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Cover        string `json:"cover"`
	ChapterCount int    `json:"chapterCount"`
}

type ApiGetSeries struct {
	Series []ApiGetSeriesItem `json:"series"`
}

type ApiGetSerieById struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	Cover        string `json:"cover"`
	ChapterCount int    `json:"chapterCount"`
}

type ApiGetSerieChaptersByIdItem struct {
	Id      string `json:"id"`
	Index   int    `json:"index"`
	Title   string `json:"title"`
	SerieId string `json:"serieId"`
}

type ApiGetSerieChaptersById struct {
	Chapters []ApiGetSerieChaptersByIdItem `json:"chapters"`
}

type ApiGetChaptersItem struct {
	Id      string `json:"id"`
	Index   int    `json:"index"`
	Title   string `json:"title"`
	SerieId string `json:"serieId"`
}

type ApiGetChapters struct {
	Chapters []ApiGetChaptersItem `json:"chapters"`
}

type ApiGetChapterById struct {
	Id            string   `json:"id"`
	Index         int      `json:"index"`
	Title         string   `json:"title"`
	SerieId       string   `json:"serieId"`
	NextChapterId string   `json:"nextChapterId,omitempty"`
	PrevChapterId string   `json:"prevChapterId,omitempty"`
	Pages         []string `json:"pages"`
}

type ApiPostRegisterBody struct {
	Username        string `json:"username" validate:"required"`
	Password        string `json:"password" validate:"required"`
	PasswordConfirm string `json:"passwordConfirm" validate:"required"`
}

type ApiPostRegister struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

type ApiPostLoginBody struct {
	Username        string `json:"username" validate:"required"`
	Password        string `json:"password" validate:"required"`
}

type ApiPostLogin struct {
}
