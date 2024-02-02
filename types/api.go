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
	ChapterCount int    `json:"chapterCount"`
}

type ApiGetSeries struct {
	Series []ApiGetSeriesItem `json:"series"`
}

type ApiGetSerieById struct {
	Id           string `json:"id"`
	Name         string `json:"name"`
	ChapterCount int    `json:"chapterCount"`
}
