package types

import "path"

type WorkDir string

func (d WorkDir) String() string {
	return string(d)
}

func (d WorkDir) DatabaseFile() string {
	return path.Join(d.String(), "data.db")
}

func (d WorkDir) ChaptersDir() string {
	return path.Join(d.String(), "chapters")
}

func (d WorkDir) ImagesDir() string {
	return path.Join(d.String(), "images")
}
