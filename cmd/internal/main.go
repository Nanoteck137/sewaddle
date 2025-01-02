package main

import (
	"encoding/json"
	"fmt"
	"os"

	"github.com/nanoteck137/pyrin/spec"
	"github.com/nanoteck137/pyrin/tools/gen"
	"github.com/nanoteck137/sewaddle/apis"
	"github.com/nanoteck137/sewaddle/core/log"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use: "internal",
}

var genCmd = &cobra.Command{
	Use: "gen",
	Run: func(cmd *cobra.Command, args []string) {
		router := spec.Router{}

		apis.RegisterHandlers(nil, &router)

		s, err := spec.GenerateSpec(router.Routes)
		if err != nil {
			log.Fatal("Failed to generate spec", "err", err)
		}

		d, err := json.MarshalIndent(s, "", "  ")
		if err != nil {
			log.Fatal("Failed to marshal server", "err", err)
		}

		err = os.WriteFile("misc/pyrin.json", d, 0644)
		if err != nil {
			log.Fatal("Failed to write pyrin.json", "err", err)
		}

		fmt.Println("Wrote 'misc/pyrin.json'")

		err = gen.GenerateTypescript(s, "web/src/lib/api")
		if err != nil {
			log.Fatal("Failed to generate golang code", "err", err)
		}

		err = gen.GenerateGolang(s, "cmd/sewaddle-cli/api")
		if err != nil {
			log.Fatal("Failed to generate golang code", "err", err)
		}
	},
}

func init() {
	rootCmd.AddCommand(genCmd)
}

func main() {
	err := rootCmd.Execute()
	if err != nil {
		log.Fatal("Failed", err)
	}
}
