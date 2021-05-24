package models

import "time"

type Ingredients struct {
	Id     int     `json:"id" gorm:"primary_key,auto_increment"`
	Title  string  `json:"title"`
	Qt     float32 `json:"qt"`
	Mesure string  `json:"mesure"`
	Desc   string  `json:"desc"` //description
	Images float64 `json:"images"`
}

type Events struct {
	Id     int       `json:"id" gorm:"primary_key,auto_increment"`
	Date   time.Time `json:"date"`
	Desc   string    `json:"desc"` //description
	Recipe int       `json:"-"`
}

type Recipes struct {
	Id          int           `json:"id" gorm:"primary_key,auto_increment"`
	Title       string        `json:"title"`
	Descri      string        `json:"descri"`    //description
	Obs         string        `json:"obs"`       //observation
	Categorie   string        `json:"categorie"` // dessert , plat , apéro ...
	Preparation int           `json:"preparation"`
	Typ         int           `json:"typ"` // vegan , vegetarian
	Cuisson     int           `json:"cuisson"`
	Repos       int           `json:"repos"`
	Lvl         int           `json:"level"` // difficulté
	NbrPers     int           `json:"nbr_pers"`
	Cout        float32       `json:"cout"`
	Url         []string      `json:"url" gorm:"foreign_key:recipe"`
	Ingr        []Ingredients `json:"ingr" gorm:"many2many:"recipes_ingredients`
	Even        []Events      `json:"even" gorm:"foreign_key:recipe"`
	Images      []Images      `json:"images" gorm:"foreign_key:recipe"`
	Usr         int           `json:"usr"`
	Share       string        `json:"share"` // partage : privé , public , groupe
}

type Images struct {
	Id     int    `json:"id" gorm:"primary_key,auto_increment"`
	src    int64  `json:"src"`
	typ    string `json:"typ"`
	size   int    `json:"size"`
	Recipe int    `json:"-"`
}

type Urls struct {
	Id     int    `json:"id" gorm:"primary_key,auto_increment"`
	Url    string `json:"url"`
	Recipe int    `json:"-"`
}
type Users struct {
	Id             int       `json:"id" gorm:"primary_key,auto_increment"`
	Name           string    `json:"name"`
	Email          string    `json:"email"`
	HashedPassword []byte    `json:"hashed_password"`
	Created        time.Time `json:"created"`
	Active         bool      `json:"active"`
	Recipes        []Recipes `json:"recipes" gorm:"foreign_key:usr`
	CreatedGroupes []Groupes `json:"groupes" gorm:"foreign_key:usr`
	Groupes        []Groupes `json:"groupes" gorm:"many2many:users_groupes` // les groupe dont les utilisateur appartient
}

type Groupes struct {
	Id      int       `json:"id" gorm:"primary_key,auto_increment"`
	Name    string    `json:"name"`
	Created time.Time `json:"created"`
	usr     int       `json:"usr"`                                // Id du user qui a crée le groupe
	Users   []Users   `json:"users" gorm:many2many:users_groupes` // les utilisateurs qui appartient aux groupe
}
