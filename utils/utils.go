package utils

import (
	"log"
	"os"
	"strings"

	"github.com/nanoteck137/sewaddle/types"
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

func ParseAuthHeader(authHeader string) (string, error) {
	splits := strings.Split(authHeader, " ")
	if len(splits) != 2 {
		return "", types.ErrInvalidAuthHeader
	}

	if splits[0] != "Bearer" {
		return "", types.ErrInvalidAuthHeader
	}

	return splits[1], nil
}

func SymlinkReplace(src, dst string) error {
	err := os.Symlink(src, dst)
	if err != nil {
		if os.IsExist(err) {
			err := os.Remove(dst)
			if err != nil {
				return err
			}

			err = os.Symlink(src, dst)
			if err != nil {
				return err
			}
		} else {
				return err
		}
	}

	return nil
}
