package main

import (
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"time"
)

const letterBytes = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

func RandStringBytes(n uint64) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = letterBytes[rand.Intn(len(letterBytes))]
	}
	return string(b)
}

func main() {
	args := os.Args[1:]
	if len(args) != 3 {
		panic(fmt.Errorf("expected exactlly 3 arguments, got: %v \n", args))
	}
	chunkSize, err := strconv.ParseUint(args[0], 10, 64)
	if err != nil {
		panic(err)
	}
	timeoutChunk, err := time.ParseDuration(args[1])
	if err != nil {
		panic(err)
	}
	timeoutTotal, err := time.ParseDuration(args[2])
	if err != nil {
		panic(err)
	}

	go func() {
		for {
			randStr := RandStringBytes(chunkSize)

			fmt.Printf("%s\n", randStr)
			time.Sleep(timeoutChunk)
		}
	}()
	time.Sleep(timeoutTotal)

	fmt.Println("DONE")
}
