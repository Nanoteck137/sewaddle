package utils

import (
	"log"

	"github.com/nrednav/cuid2"
)


var CreateId = createIdGenerator()

func createIdGenerator() func() string {
	res, err := cuid2.Init(cuid2.WithLength(32))
	if err != nil {
		log.Fatal(err)
	}

	return res
}
