package cli

import (
	"log"

	"github.com/nanoteck137/sewaddle"
	"github.com/nanoteck137/sewaddle/config"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:     sewaddle.AppName,
	Version: sewaddle.Version,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}

func init() {
	rootCmd.SetVersionTemplate(sewaddle.VersionTemplate(sewaddle.AppName))

	cobra.OnInitialize(config.InitConfig)

	rootCmd.PersistentFlags().StringVarP(&config.ConfigFile, "config", "c", "", "Config File")
}
