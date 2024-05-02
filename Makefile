all: types

types:
	pyrin gen go api.pyrin -o types/api_gen.go -f

build:
	go build -o build/sewaddle

clean:
	rm -rf ./build
	rm -rf ./tmp
	rm -rf ./work

.PHONY: types build clean
