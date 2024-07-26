package library

import (
	"encoding/json"
	"fmt"
	"os"
	"path"

	"github.com/flytam/filenamify"
)

type Library struct {
	Base   string
	Series []SerieMetadata
}

func ReadFromDir(dir string) (*Library, error) {
	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	var series []SerieMetadata

	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}

		p := path.Join(dir, entry.Name())

		data, err := os.ReadFile(path.Join(p, "manga.json"))
		if err != nil {
			if os.IsNotExist(err) {
				continue
			}

			return nil, err
		}

		var metadata SerieMetadata
		err = json.Unmarshal(data, &metadata)
		if err != nil {
			return nil, err
		}

		metadata.path = p

		series = append(series, metadata)
	}

	return &Library{
		Base:   dir,
		Series: series,
	}, nil
}

func (lib *Library) AddSerie(serie SerieMetadata) error {
	for _, sm := range lib.Series {
		if sm.Title == serie.Title {
			return fmt.Errorf("Serie with name '%v' already exists", serie.Title)
		}
	}

	serie.new = true
	lib.Series = append(lib.Series, serie)
	return nil
}

func (lib *Library) FlushToDisk() error {
	for i, serie := range lib.Series {
		if serie.new {
			title, err := filenamify.FilenamifyV2(serie.Title, func(options *filenamify.Options) {
				options.Replacement = ""
			})
			if err != nil {
				return err
			}

			d := path.Join(lib.Base, title)
			err = os.Mkdir(d, 0755)
			if err != nil {
				return err
			}

			data, err := json.MarshalIndent(serie, "", "  ")
			if err != nil {
				return err
			}

			out := path.Join(d, "manga.json")
			err = os.WriteFile(out, data, 0644)
			if err != nil {
				return err
			}

			lib.Series[i].path = d
			lib.Series[i].new = false
		}

		if serie.changed {
			data, err := json.MarshalIndent(serie, "", "  ")
			if err != nil {
				return err
			}

			out := path.Join(serie.path, "manga.json")
			err = os.WriteFile(out, data, 0644)
			if err != nil {
				return err
			}

			lib.Series[i].changed = false
		}
	}

	return nil
}
