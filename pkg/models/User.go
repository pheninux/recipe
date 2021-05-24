package models

import (
	"errors"
	"time"
)

var (
	ErrNoRecord           = errors.New("models: no matching record found")
	ErrInvalidCredentials = errors.New("models: invalid credentials")
	ErrDuplicateEmail     = errors.New("models: duplicate email")
)

type UserOld struct {
	ID       int    `gorm:"primary_key;auto_increment"`
	User     string `json:"user"`
	PassWord string `json:"pass_word"`
}

type User struct {
	Id             int       `gorm:"primary_key,auto_increment" json:"id"`
	CreatedAt      time.Time `json:"created_at"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	HashedPassword []byte    `json:"hashed_password"`
	Active         bool      `json:"active"`
}
