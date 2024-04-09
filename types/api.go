package types

import (
	"net/http"
)

var (
	ErrInvalidAuthHeader = NewApiError(http.StatusUnauthorized, "Invalid Auth Header")
	ErrChapterNotFound = NewApiError(http.StatusNotFound, "Chapter not found")
	ErrInvalidToken = NewApiError(http.StatusUnauthorized, "Invalid Token")
)

const (
	StatusSuccess = "success"
	StatusError   = "error"
)

type ApiError struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
	Errors  any    `json:"errors,omitempty"`
}

func (err *ApiError) Error() string {
	return err.Message
}

func NewApiError(code int, message string, errors ...any) *ApiError {
	var e any
	if len(errors) > 0 {
		e = errors[0]
	}

	return &ApiError{
		Code:    code,
		Message: message,
		Errors:  e,
	}
}

type ApiResponse struct {
	Status string    `json:"status"`
	Data   any       `json:"data,omitempty"`
	Error  *ApiError `json:"error,omitempty"`
}

func NewApiSuccessResponse(data any) ApiResponse {
	return ApiResponse{
		Status: StatusSuccess,
		Data:   data,
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

type ApiGetChapterByIdUser struct {
	IsMarked bool `json:"isMarked"`
}

type ApiGetChapterById struct {
	Id            string   `json:"id"`
	Index         int      `json:"index"`
	Title         string   `json:"title"`
	SerieId       string   `json:"serieId"`
	NextChapterId string   `json:"nextChapterId,omitempty"`
	PrevChapterId string   `json:"prevChapterId,omitempty"`
	Pages         []string `json:"pages"`

	User *ApiGetChapterByIdUser `json:"user,omitempty"` 
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
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type ApiPostLogin struct {
	Token string `json:"token"`
}

type ApiGetMe struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}
