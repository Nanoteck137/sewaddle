package utils

import (
	"log"
	"os"
	"strconv"
	"strings"
	"unicode"

	"github.com/gosimple/slug"
	"github.com/mitchellh/mapstructure"
	"github.com/nanoteck137/sewaddle/types"
	"github.com/nrednav/cuid2"
)

var CreateId = createIdGenerator()

func createIdGenerator() func() string {
	res, err := cuid2.Init(cuid2.WithLength(8))
	if err != nil {
		log.Fatal(err)
	}

	return res
}

func Slug(s string) string {
	return slug.Make(s)
}

func ExtractNumber(s string) int {
	n := ""
	for _, c := range s {
		if unicode.IsDigit(c) {
			n += string(c)
		} else {
			break
		}
	}

	if len(n) == 0 {
		return 0
	}

	i, err := strconv.ParseInt(n, 10, 64)
	if err != nil {
		return 0
	}

	return int(i)
}

func Decode(input interface{}, output interface{}) error {
	config := &mapstructure.DecoderConfig{
		Metadata: nil,
		Result:   output,
		TagName:  "json",
	}

	decoder, err := mapstructure.NewDecoder(config)
	if err != nil {
		return err
	}

	return decoder.Decode(input)
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
