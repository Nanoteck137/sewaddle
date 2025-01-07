package cmd

import (
	"bytes"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path"

	"github.com/kr/pretty"
	"github.com/nanoteck137/sewaddle/cmd/sewaddle-cli/api"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/spf13/cobra"
)

var serieCmd = &cobra.Command{
	Use: "serie",
}

var serieNewCmd = &cobra.Command{
	Use: "new",
	Run: func(cmd *cobra.Command, args []string) {
		cover, _ := cmd.Flags().GetString("cover")
		server, _ := cmd.Flags().GetString("server")

		name, _ := cmd.Flags().GetString("name")

		apiClient := api.New(server)

		serie, err := apiClient.CreateSerie(api.CreateSerieBody{
			Name: name,
		}, api.Options{})
		if err != nil {
			// TODO(patrik): Print better error
			pretty.Println(err)
			log.Fatal("Failed to create serie", "err", err)
		}

		fmt.Printf("Serie ID: %s\n", serie.SerieId)

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

		if cover != "" {
			fmt.Println("Setting serie cover...")
			err = setSerieCover(cover)
			if err != nil {
				log.Fatal("Failed to set serie cover", "err", err)
			}
		}
	},
}

func init() {
	serieNewCmd.Flags().String("name", "", "Serie name (required)")
	serieNewCmd.MarkFlagRequired("name")
	serieNewCmd.Flags().String("cover", "", "Serie cover filename (optional)")

	serieCmd.AddCommand(serieNewCmd)

	rootCmd.AddCommand(serieCmd)
}
