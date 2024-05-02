package cmd

import (
	"log"

	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/library"
	"github.com/spf13/cobra"
)

var devCmd = &cobra.Command{
	Use: "dev",
}

var devLibraryCmd = &cobra.Command{
	Use: "library",
}

var devLibraryImportCmd = &cobra.Command{
	Use: "import",
	Run: func(cmd *cobra.Command, args []string) {
		workDir, err := config.BootstrapDataDir()
		if err != nil {
			log.Fatal(err)
		}

		db, err := database.Open(workDir)
		if err != nil {
			log.Fatal(err)
		}

		lib, err := library.ReadFromDir("/Volumes/media/manga")
		if err != nil {
			log.Fatal(err)
		}

		lib.Sync(db, workDir)
	},
}

func init() {
	devLibraryCmd.AddCommand(devLibraryImportCmd)

	devCmd.AddCommand(devLibraryCmd)

	rootCmd.AddCommand(devCmd)
}
