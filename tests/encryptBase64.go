package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"log"
)

func main() {
	data := "sherine2011"

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(data), 12)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(hashedPassword))
}
