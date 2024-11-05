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

func (d WorkDir) SeriesDir() string {
	return path.Join(d.String(), "series")
}

func (d WorkDir) SerieDir(slug string) SerieDir {
	return SerieDir(path.Join(d.SeriesDir(), slug))
}

type SerieDir string

func (d SerieDir) String() string {
	return string(d)
}

func (d SerieDir) ImagesDir() string {
	return path.Join(d.String(), "images")
}

func (d SerieDir) ChaptersDir() string {
	return path.Join(d.String(), "chapters")
}

func (d SerieDir) ChapterDir(slug string) string {
	return path.Join(d.ChaptersDir(), slug)
}
