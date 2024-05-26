package types

import (
	"net/http"
)

var (
	ErrInvalidAuthHeader = NewApiError(http.StatusUnauthorized, "Invalid Auth Header")
	ErrInvalidToken      = NewApiError(http.StatusUnauthorized, "Invalid Token")
	ErrIncorrectCreds    = NewApiError(http.StatusUnauthorized, "Incorrect credentials")

	ErrNoBookmark = NewApiError(http.StatusNotFound, "Bookmark not found")
	ErrNoChapter  = NewApiError(http.StatusNotFound, "Chapter not found")
	ErrNoSerie    = NewApiError(http.StatusNotFound, "Serie not found")

	ErrChapterAlreadyMarked = NewApiError(http.StatusBadRequest, "Chapter is already marked")
	ErrNoChapterToUnmark    = NewApiError(http.StatusBadRequest, "Chapter is already marked")

	ErrEmptyBody = NewApiError(400, "Expected body not to be empty")
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
