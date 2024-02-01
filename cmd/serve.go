package cmd

import (
	"fmt"

	"github.com/spf13/cobra"
)

var serveCmd = &cobra.Command{
	Use: "serve",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println("Serve command")
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
