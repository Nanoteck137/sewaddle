package library_test

import (
	"testing"

	"github.com/nanoteck137/sewaddle/library"
)

func TestLibrary(t *testing.T) {
	testDir := t.TempDir()

	// TODO(patrik): Add more testing

	lib, err := library.ReadFromDir(testDir)
	if err != nil {
		t.Fatalf("Failed to read library: %v", err)
	}

	err = lib.AddSerie(library.SerieMetadata{
		Title: "Testing",
		Chapters: []library.ChapterMetadata{
			{
				Number: 1,
				Name:   "Test Chapter",
				Pages:  []string{"page01.png", "page02.png"},
			},
		},
		Extra: map[string]any{
			"some-extra": "hello world",
		},
	})

	if err != nil {
		t.Fatalf("Failed to add serie: %v", err)
	}

	err = lib.FlushToDisk()
	if err != nil {
		t.Fatalf("Failed to flush library to disk: %v", err)
	}
}
