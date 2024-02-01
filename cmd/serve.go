package cmd

import (
	"log"

	"github.com/nanoteck137/sewaddle/api"
	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use: "serve",
	Run: func(cmd *cobra.Command, args []string) {
		api := api.New()
		if err := api.Start(":3000"); err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
