package cmd

import (
	"fmt"
	"log"
	"os"
	"path"

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

func getDefaultDataDir() string {
	// TODO(patrik): XDG_CONFIG_HOME is this right?
	stateHome := os.Getenv("XDG_STATE_HOME")
	if stateHome == "" {
		userHome, err := os.UserHomeDir()
		if err != nil {
			log.Fatal(err)
		}
		stateHome = path.Join(userHome, ".local", "state")
	}

	return path.Join(stateHome, appName)
}

func getDefaultConfigDir() string {
	// TODO(patrik): XDG_CONFIG_HOME is this right?
	configHome := os.Getenv("XDG_CONFIG_HOME")
	if configHome == "" {
		userHome, err := os.UserHomeDir()
		if err != nil {
			log.Fatal(err)
		}

		configHome = path.Join(userHome, ".config")
	}

	return path.Join(configHome, appName)
}

func setDefaults() {
	viper.SetDefault("listen_addr", ":3000")

	// dataDir := getDefaultDataDir()
	// viper.SetDefault("data_dir", dataDir)
}

func validateConfig(config *Config) {
	good := true

	validate := func(expr bool, msg string) {
		if expr {
			fmt.Println("Err:", msg)
			good = false
		}
	}
	
	validate(config.DataDir == "", "data_dir needs to be set")

	if !good {
		os.Exit(-1)
	}
}

func initConfig() {
	setDefaults()

	if cfgFile != "" {
		viper.SetConfigFile(cfgFile)
	} else {
		configPath := getDefaultConfigDir()
		viper.AddConfigPath(configPath)
		viper.AddConfigPath("/etc/" + appName)
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
