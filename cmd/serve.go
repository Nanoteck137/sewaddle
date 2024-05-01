package cmd

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/mattn/go-sqlite3"
	"github.com/nanoteck137/sewaddle/database"
	"github.com/nanoteck137/sewaddle/server"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var serveCmd = &cobra.Command{
	Use: "serve",
	Run: func(cmd *cobra.Command, args []string) {
		dataDir := viper.GetString("data_dir")
		workDir := types.WorkDir(dataDir)

		// TODO(patrik): Bootstrap the directory

		dbUrl := fmt.Sprintf("file:%s?_foreign_keys=true", workDir.DatabaseFile())

		fmt.Printf("workDir.DatabaseFile(): %v\n", workDir.DatabaseFile())
		fmt.Printf("workDir.ChaptersDir(): %v\n", workDir.ChaptersDir())
		fmt.Printf("workDir.ImagesDir(): %v\n", workDir.ImagesDir())

		log.Fatal()

		conn, err := sql.Open("sqlite3", dbUrl);
		if err != nil {
			log.Fatal(err)
		}

		db := database.New(conn)

		server := server.New(db, workDir)

		listenAddr := viper.GetString("listen_addr")
		err = server.Start(listenAddr)
		if err != nil {
			log.Fatal(err)
		}
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
