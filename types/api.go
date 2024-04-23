package types

import (
	"net/http"
)

var (
	ErrInvalidAuthHeader = NewApiError(http.StatusUnauthorized, "Invalid Auth Header")
	ErrChapterNotFound   = NewApiError(http.StatusNotFound, "Chapter not found")
	ErrInvalidToken      = NewApiError(http.StatusUnauthorized, "Invalid Token")
	ErrIncorrectCreds    = NewApiError(http.StatusUnauthorized, "Incorrect credentials")
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

type ApiGetChapterByIdUser struct {
	IsMarked bool `json:"isMarked"`
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

type ApiPostSerieUpdateBody struct {
	SerieId       string `json:"serieId"`
	ChapterNumber int    `json:"chapterNumber"`
}

type ApiPostUserMarkChapters struct {
	SerieId  string `json:"serieId"`
	Chapters []int  `json:"chapters"`
}

type ApiPostUserUnmarkChapters struct {
	SerieId  string `json:"serieId"`
	Chapters []int  `json:"chapters"`
}

type ApiPostUserUpdateBookmark struct {
	SerieId string `json:"serieId"`
	Chapter int    `json:"chapter"`
	Page    int    `json:"page"`
}
