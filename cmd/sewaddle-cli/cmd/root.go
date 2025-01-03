package cmd

import (
	"log"

	"github.com/nanoteck137/sewaddle"
	"github.com/spf13/cobra"
)

var AppName = sewaddle.AppName + "-cli"

var rootCmd = &cobra.Command{
	Use:     AppName,
	Version: sewaddle.Version,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}

var cfgFile string

func init() {
	rootCmd.SetVersionTemplate(sewaddle.VersionTemplate(AppName))

	rootCmd.PersistentFlags().String("server", "", "Server Address")
	rootCmd.MarkPersistentFlagRequired("server")

	rootCmd.PersistentFlags().String("web", "", "Web Address")
	// rootCmd.MarkPersistentFlagRequired("web")

	rootCmd.PersistentFlags().StringVarP(&cfgFile, "config", "c", "", "Config File")
}
