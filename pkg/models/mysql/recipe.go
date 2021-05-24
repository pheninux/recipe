package mysql

import (
	"errors"
	"github.com/jinzhu/gorm"
)

var ErrNoRecord = errors.New("models: no matching record found")

type DataModel struct {
	Db *gorm.DB
}
