package library

type ChapterMetadata struct {
	Slug  string   `json:"slug"`
	Name  string   `json:"name"`
	Pages []string `json:"pages"`
}

type SerieMetadata struct {
	Title    string            `json:"title"`
	CoverArt string            `json:"coverArt"`
	Chapters []ChapterMetadata `json:"chapters"`

	path    string
	new     bool
	changed bool
}

func (s *SerieMetadata) MarkChanged() {
	s.changed = true
}

func (s SerieMetadata) Path() string {
	return s.path
}
