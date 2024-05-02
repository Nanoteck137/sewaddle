package cmd

import (
	"fmt"
	"log"
	"os"

	"github.com/kr/pretty"
	"github.com/nanoteck137/sewaddle/types"
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
	DataDir    string `mapstructure:"data_dir"`
}

func (c *Config) WorkDir() types.WorkDir {
	return types.WorkDir(c.DataDir)
}

func (c *Config) BootstrapDataDir() (types.WorkDir, error) {
	workDir := c.WorkDir()

	err := os.MkdirAll(workDir.ImagesDir(), 0755)
	if err != nil {
		return workDir, err
	}

	err = os.MkdirAll(workDir.ChaptersDir(), 0755)
	if err != nil {
		return workDir, err
	}

	return workDir, nil
}

func setDefaults() {
	viper.SetDefault("listen_addr", ":3000")
	viper.BindEnv("data_dir")
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

var config Config

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

	err = viper.Unmarshal(&config)
	if err != nil {
		log.Fatal("Failed to unmarshal config: ", err)
	}

	pretty.Println(config)
	validateConfig(&config)
}
