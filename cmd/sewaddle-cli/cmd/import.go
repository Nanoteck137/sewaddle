package cmd

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"
	"sort"
	"strconv"
	"strings"

	"github.com/kr/pretty"
	"github.com/maruel/natural"
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

type ComicInfo struct {
	Title string 
}

var importCbzCmd = &cobra.Command{
	Use: "cbz <SERIE_ID> <...CBZ>",
	Args: cobra.MinimumNArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		serieId := args[0]
		files := args[1:]

		server, _ := cmd.Flags().GetString("server")

		apiClient := api.New(server)

		fmt.Printf("serieId: %v\n", serieId)
		pretty.Println(files)

		uploadChapter := func(body api.UploadChapterBody, pages []*zip.File) error {
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
				dw, err := w.CreateFormFile("pages", strconv.Itoa(i)+path.Ext(p.Name))
				if err != nil {
					return err
				}

				src, err := p.Open()
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

		_ = uploadChapter

		for _, file := range files {
			zr, err := zip.OpenReader(file)
			if err != nil {
				log.Fatal("Failed to open zip reader", "err", err)
			}
			defer zr.Close()

			chapterName := strings.TrimSuffix(path.Base(file), path.Ext(file))

			var images []*zip.File

			for _, f := range zr.File {
				ext := path.Ext(f.Name)

				if f.Name == "ComicInfo.xml" {
					fmt.Println("Found ComicInfo.xml")

					r, err := f.Open()
					if err != nil {
						log.Fatal("Failed to open zip file", "name", f.Name, "err", err)
					}

					var comicInfo ComicInfo
					decoder := xml.NewDecoder(r)
					err = decoder.Decode(&comicInfo)
					if err != nil {
						log.Fatal("Failed to decode xml", "err", err)
					}

					chapterName = comicInfo.Title

					pretty.Println(comicInfo)
					continue
				}

				switch ext {
				case ".png", ".jpg", ".jpeg":
					images = append(images, f)
				default:
					fmt.Printf("Found unsupported file extention: %s (skipping)\n", f.Name)
				}
			}

			fmt.Printf("name: %v\n", chapterName)

			sort.SliceStable(images, func(i, j int) bool {
				return natural.Less(images[i].Name, images[j].Name)
			})

			err = uploadChapter(api.UploadChapterBody{
				Name:    chapterName,
				SerieId: serieId,
			}, images)
			if err != nil {
				log.Fatal("Failed to upload chapter", "path", file, "err", err)
			}
		}
	},
}

func init() {
	importOldCmd.Flags().StringP("dir", "d", ".", "Directory to import")
	importOldCmd.Flags().Bool("exclude-chapters", false, "Excludes chapters and only imports the serie")

	importCmd.AddCommand(importOldCmd)
	importCmd.AddCommand(importCbzCmd)

	rootCmd.AddCommand(importCmd)
}
