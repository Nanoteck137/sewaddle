package types

import "path"

type Change[T any] struct {
	Value   T
	Changed bool
}

type WorkDir string

func (d WorkDir) String() string {
	return string(d)
}

func (d WorkDir) DatabaseFile() string {
	return path.Join(d.String(), "data.db")
}

func (d WorkDir) SetupFile() string {
	return path.Join(d.String(), "setup")
}

func (d WorkDir) Trash() string {
	return path.Join(d.String(), "trash")
}

// TODO(patrik): Remove
func (d WorkDir) ExportFile() string {
	return path.Join(d.String(), "export.json")
}

func (d WorkDir) SeriesDir() string {
	return path.Join(d.String(), "series")
}

func (d WorkDir) SerieDir(id string) string {
	return path.Join(d.SeriesDir(), id)
}

func (d WorkDir) ChaptersDir() string {
	return path.Join(d.String(), "chapters")
}

func (d WorkDir) ChapterDir(id string) string {
	return path.Join(d.ChaptersDir(), id)
}
