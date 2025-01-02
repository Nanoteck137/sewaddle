package cmd

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"
	"strconv"

	"github.com/kr/pretty"
	"github.com/nanoteck137/sewaddle/cmd/sewaddle-cli/api"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/spf13/cobra"
)

var importCmd = &cobra.Command{
	Use: "import",
}

type OldMangaChapter struct {
	Index int      `json:"index"`
	Name  string   `json:"name"`
	Pages []string `json:"pages"`
}

type OldMangaInfo struct {
	Title    string            `json:"title"`
	Cover    string            `json:"cover"`
	Chapters []OldMangaChapter `json:"chapters"`
}

var importOldCmd = &cobra.Command{
	Use: "old",
	Run: func(cmd *cobra.Command, args []string) {

		server, _ := cmd.Flags().GetString("server")
		dir, _ := cmd.Flags().GetString("dir")
		excludeChapters, _ := cmd.Flags().GetBool("exclude-chapters")

		mangaInfoFilename := path.Join(dir, "manga.json")
		data, err := os.ReadFile(mangaInfoFilename)
		if err != nil {
			log.Fatal("Failed", "err", err)
		}

		var mangaInfo OldMangaInfo
		err = json.Unmarshal(data, &mangaInfo)
		if err != nil {
			log.Fatal("Failed", "err", err)
		}

		pretty.Println(mangaInfo)

		apiClient := api.New(server)

		serie, err := apiClient.CreateSerie(api.CreateSerieBody{
			Name: mangaInfo.Title,
		}, api.Options{})
		if err != nil {
			log.Fatal("Failed", "err", err)
		}

		setSerieCover := func(filename string) error {
			var b bytes.Buffer
			w := multipart.NewWriter(&b)

			dw, err := w.CreateFormFile("cover", path.Base(filename))
			if err != nil {
				return err
			}

			src, err := os.Open(filename)
			if err != nil {
				return err
			}
			defer src.Close()

			_, err = io.Copy(dw, src)
			if err != nil {
				return err
			}

			err = w.Close()
			if err != nil {
				return err
			}

			_, err = apiClient.ChangeSerieCover(serie.SerieId, &b, api.Options{
				Boundary: w.Boundary(),
			})
			if err != nil {
				return err
			}

			return nil
		}

		pretty.Println(serie)

		fmt.Printf("Setting serie cover ...")

		p := path.Join(dir, "images", mangaInfo.Cover)
		err = setSerieCover(p)
		if err != nil {
			fmt.Printf("failed\n")
			log.Fatal("Failed to set serie cover", "err", err)
		}

		fmt.Printf("done\n")

		uploadChapter := func(body api.UploadChapterBody, pages []string) error {
			var b bytes.Buffer
			w := multipart.NewWriter(&b)

			{
				dw, err := w.CreateFormField("body")
				if err != nil {
					return err
				}

				encoder := json.NewEncoder(dw)
				err = encoder.Encode(&body)
				if err != nil {
					return err
				}
			}

			for i, p := range pages {
				dw, err := w.CreateFormFile("pages", strconv.Itoa(i)+path.Ext(p))
				if err != nil {
					return err
				}

				src, err := os.Open(p)
				if err != nil {
					return err
				}
				defer src.Close()

				_, err = io.Copy(dw, src)
				if err != nil {
					return err
				}
			}

			err := w.Close()
			if err != nil {
				return err
			}

			_, err = apiClient.UploadChapter(&b, api.Options{
				Boundary: w.Boundary(),
			})
			if err != nil {
				return err
			}

			return nil
		}

		if !excludeChapters {
			for _, chapter := range mangaInfo.Chapters {
				fmt.Printf("Uploading '%s' ...", chapter.Name)
				chapterDir := path.Join(dir, "chapters", strconv.Itoa(chapter.Index))

				var pages []string
				for _, p := range chapter.Pages {
					pages = append(pages, path.Join(chapterDir, p))
				}

				err := uploadChapter(api.UploadChapterBody{
					Name:    chapter.Name,
					SerieId: serie.SerieId,
				}, pages)
				if err != nil {
					fmt.Printf("failed\n")
					log.Fatal("Failed to upload chapter", "err", err)
				}

				fmt.Printf("done\n")
			}
		}
	},
}

func init() {
	importOldCmd.Flags().StringP("dir", "d", ".", "Directory to import")
	importOldCmd.Flags().Bool("exclude-chapters", false, "Excludes chapters and only imports the serie")

	importCmd.AddCommand(importOldCmd)

	rootCmd.AddCommand(importCmd)
}
