package main

import (
	// TODO(patrik): Move
	_ "github.com/mattn/go-sqlite3"

	"github.com/nanoteck137/sewaddle/cmd"
)

func main() {
	cmd.Execute()
}
