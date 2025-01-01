package apis

import (
	"net/http"

	"github.com/nanoteck137/pyrin"
)

const (
	ErrTypeSerieNotFound   pyrin.ErrorType = "SERIE_NOT_FOUND"
	ErrTypeChapterNotFound pyrin.ErrorType = "CHAPTER_NOT_FOUND"

	ErrTypeInvalidAuth       pyrin.ErrorType = "INVALID_AUTH"
	ErrTypeUserAlreadyExists pyrin.ErrorType = "USER_ALREADY_EXISTS"
)

func SerieNotFound() *pyrin.Error {
	return &pyrin.Error{
		Code:    http.StatusNotFound,
		Type:    ErrTypeSerieNotFound,
		Message: "Serie not found",
	}
}

func ChapterNotFound() *pyrin.Error {
	return &pyrin.Error{
		Code:    http.StatusNotFound,
		Type:    ErrTypeChapterNotFound,
		Message: "Chapter not found",
	}
}

func InvalidAuth(message string) *pyrin.Error {
	return &pyrin.Error{
		Code:    http.StatusBadRequest,
		Type:    ErrTypeInvalidAuth,
		Message: "Invalid auth: " + message,
	}
}

func UserAlreadyExists() *pyrin.Error {
	return &pyrin.Error{
		Code:    http.StatusBadRequest,
		Type:    ErrTypeUserAlreadyExists,
		Message: "User already exists",
	}
}
