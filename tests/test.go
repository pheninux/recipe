package main

import (
	"encoding/json"
	"flag"
	"fmt"
	mux2 "github.com/gorilla/mux"
	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/mysql"
	"io/ioutil"
	"log"
	"net/http"
)

type Application struct {
	db *gorm.DB
}

type Personne struct {
	Id        int          `gorm:"primary_key,auto_increment" json:"id"`
	Nom       string       `gorm:"type:varchar(25);not null" json:"nom"`
	Formation []*Formation `gorm:"many2many:personnes_formations_documents" json:"formation"`
	Document  []*Document  `gorm:"many2many:personnes_formations_documents" json:"document"`
}
type Formation struct {
	Id       int         `gorm:"primary_key,auto_increment" json:"id"`
	Nom      string      `gorm:"type:varchar(25);not null" json:"nom"`
	Document []*Document `gorm:"many2many:personnes_formations_documents" json:"document"`
	Personne []*Personne `gorm:"many2many:personnes_formations_documents" json:"personne"`
}
type Document struct {
	Id        int          `gorm:"primary_key,auto_increment" json:"id"`
	Nom       string       `gorm:"type:varchar(25);not null" json:"nom"`
	Formation []*Formation `gorm:"many2many:personnes_formations_documents"  json:"formation"`
	Personne  []*Personne  `gorm:"many2many:personnes_formations_documents"  json:"formation"`
}

func openGormDB(dsn string) (*gorm.DB, error) {

	db, err := gorm.Open("mysql", dsn)
	if err != nil {
		return nil, err
	}
	fmt.Println("Gorm : Connexion ok")
	return db, err
}

func createTables(db *gorm.DB) {

	//db.Debug().AutoMigrate(Personne{})
	//db.Debug().AutoMigrate(Formation{})
	//db.Debug().AutoMigrate(Document{})
	//db.Debug().AutoMigrate(PersonnesFormationsDocuments{})
}

func createForeignKeys(db *gorm.DB) {

	//db.Debug().Table("personnes_formations").AddForeignKey("personne_id", "personnes(id)", "CASCADE", "CASCADE")
	//db.Debug().Table("personnes_formations").AddForeignKey("formation_id", "formations(id)", "CASCADE", "CASCADE")
	//db.Debug().Table("personnes_documents").AddForeignKey("personne_id", "personnes(id)", "CASCADE", "CASCADE")
	//db.Debug().Table("personnes_documents").AddForeignKey("document_id", "documents(id)", "CASCADE", "CASCADE")
	//db.Debug().Model(PersonnesFormationsDocuments{}).AddForeignKey("personne_id", "personnes(id)", "CASCADE", "CASCADE")
	//db.Debug().Model(PersonnesFormationsDocuments{}).AddForeignKey("formation_id", "formations(id)", "CASCADE", "CASCADE")
	//db.Debug().Model(PersonnesFormationsDocuments{}).AddForeignKey("document_id", "documents(id)", "CASCADE", "CASCADE")
}

func (app *Application) createRoots() {
	mux := mux2.NewRouter().StrictSlash(true)
	mux.HandleFunc("/add/personne", app.createPersonne).Methods("POST")
	port := fmt.Sprintf(":%d", 4000)
	fmt.Printf("\n\nListening port %s...\n", port)
	log.Fatal(http.ListenAndServe(port, mux))

}

func (app *Application) createPersonne(w http.ResponseWriter, r *http.Request) {

	b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		fmt.Println(err)
	}
	p := Personne{}
	if err := json.Unmarshal(b, &p); err != nil {
		fmt.Println(err)
		return
	}
	app.creatSql(app.db, p)
}

func (app *Application) creatSql(db *gorm.DB, p Personne) {

	err := app.db.Debug().Create(&p).Error
	if err != nil {
		fmt.Println(err)
		return
	}
}

func main() {

	dsn := flag.String("dsn", "root:r00t@tcp(localhost:3306)/test_gorm_mapping?parseTime=true", "MySQL data source name")
	flag.Parse()
	db, err := openGormDB(*dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()

	app := new(Application)
	app.db = db

	createTables(db)
	createForeignKeys(db)
	app.createRoots()

}
