package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/kr/pretty"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var appName = "sewaddle"

var rootCmd = &cobra.Command{
	Use: appName,
}

func Execute() {
	if err := rootCmd.Execute(); err != nil {
		log.Fatal(err)
	}
}

var cfgFile string

func init() {
	cobra.OnInitialize(initConfig)

	rootCmd.PersistentFlags().StringVarP(&cfgFile, "config", "c", "", "Config File")
}

type Config struct {
	ListenAddr string `mapstructure:"listen_addr"`
	DataDir string `mapstructure:"data_dir"`
}

func setDefaults() {
	viper.SetDefault("listen_addr", ":3000")
}

func validateConfig(config *Config) {
	hasError := false

	validate := func(expr bool, msg string) {
		if expr {
			fmt.Println("Err:", msg)
			hasError = true
		}
	}
	
	// NOTE(patrik): Has default value, here for completeness
	validate(config.ListenAddr == "", "listen_addr needs to be set")
	validate(config.DataDir == "", "data_dir needs to be set")

	if hasError {
		fmt.Println("Config is not valid")
		os.Exit(-1)
	}
}

func initConfig() {
	setDefaults()

	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		viper.AddConfigPath(".")
		viper.SetConfigName("config")
	}

	viper.SetEnvPrefix(appName)
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Println("Failed to load config: ", err)
	}

	var config Config
	err = viper.Unmarshal(&config)
	if err != nil {
		log.Fatal("Failed to unmarshal config: ", err)
	}

	pretty.Println(config)
	validateConfig(&config)
}
