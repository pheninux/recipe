package mysql

import (
	"adilhaddad.net/agefice-docs/pkg/models"
	"database/sql"
	"errors"
	"github.com/go-sql-driver/mysql"
	"golang.org/x/crypto/bcrypt"
	"strings"
	"time"
)

/*func (m *UserModel) SaveUser(u models.User) error {

	err := m.DB.Debug().Create(&u).Error
	return err
}

func (m *UserModel) GetLoginByLogin(p models.User) (u models.User,  err error) {

	return u, m.DB.Debug().Find(&u, "user = ?", &p.User).Error

}*/

// We'll use the Insert method to add a new record to the users table.
func (db *DataModel) InsertUser(name, email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	if err != nil {
		return err
	}
	err = db.Db.Debug().Create(&models.User{CreatedAt: time.Now(), Name: name, Email: email, HashedPassword: hashedPassword}).Error
	if err != nil {
		// If this returns an error, we use the errors.As() function to check // whether the error has the type *mysql.MySQLError. If it does, the
		// error will be assigned to the mySQLError variable. We can then check // whether or not the error relates to our users_uc_email key by
		// checking the contents of the message string. If it does, we return // an ErrDuplicateEmail error.
		var mySQLError *mysql.MySQLError
		if errors.As(err, &mySQLError) {
			if mySQLError.Number == 1062 && strings.Contains(mySQLError.Message, "users_uc_email") {
				return models.ErrDuplicateEmail
			}
		}
		return err
	}
	return nil
}

// We'll use the Authenticate method to verify whether a user exists with // the provided email address and password. This will return the relevant // user ID if they do.
func (db *DataModel) Authenticate(email, password string) (int, error) {
	// Retrieve the id and hashed password associated with the given email. If no
	// matching email exists, or the user is not active, we return the
	// ErrInvalidCredentials error.
	u := models.User{}
	err := db.Db.Debug().Table("users").Where("email = ?", email).Find(&u).Error
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, models.ErrInvalidCredentials
		} else {
			return 0, err
		}
	}
	// Check whether the hashed password and plain-text password provided match. // If they don't, we return the ErrInvalidCredentials error.
	err = bcrypt.CompareHashAndPassword(u.HashedPassword, []byte(password))
	if err != nil {
		if errors.Is(err, bcrypt.ErrMismatchedHashAndPassword) {
			return 0, models.ErrInvalidCredentials
		} else {
			return 0, err
		}
	}
	// Otherwise, the password is correct. Return the user ID.
	return u.Id, nil
}

// We'll use the Get method to fetch details for a specific user based // on their user ID.
func (db *DataModel) GetUser(id int) (*models.User, error) {
	u := models.User{}
	err := db.Db.Debug().Table("users").Where("id = ?", id).Find(&u).Error
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, models.ErrNoRecord
		} else {
			return nil, err
		}
	}
	return &u, nil
}
