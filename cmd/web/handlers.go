package main

import (
	"adilhaddad.net/agefice-docs/pkg/forms"
	"adilhaddad.net/agefice-docs/pkg/models"
	"errors"
	"net/http"
)

func (app *application) SaveOrCheckLogin(w http.ResponseWriter, r *http.Request) {

	// parse r body as byte and then to player object

	/*b, err := ioutil.ReadAll(r.Body)
	if err != nil {
		app.serverError(w, err)
		return
	}
	u := models.User{}
	type mess struct {
		Msg string
	}
	if err := json.Unmarshal(b, &u); err != nil {
		app.serverError(w, err)
		return
	}
	findUser, err := app.dbModel.GetLoginByLogin(u)
	if err == nil && findUser.User != "" {
		if app.comparePasswords(findUser.PassWord, []byte(u.PassWord)) {
			json.NewEncoder(w).Encode(&struct {
				Msg string `json:"msg"`
			}{Msg: "User identified"})
		} else {
			json.NewEncoder(w).Encode(&struct {
				Msg string `json:"msg"`
			}{Msg: "Mot de passe incorrect"})

		}
	} else {
		json.NewEncoder(w).Encode(&struct {
			Msg string `json:"msg"`
		}{Msg: err.Error()})
		hashedPass := app.hashAndSalt([]byte(u.PassWord))
		u.PassWord = hashedPass

		err = app.dbModel.SaveUser(u)
		if err == nil {
			if err := json.NewEncoder(w).Encode("Erreur lors de la creation du user"); err != nil {
				app.serverError(w, err)
				return
			}
		} else {
			app.serverError(w, err)
			return
		}
	}*/
}

func (app *application) homeTemp(w http.ResponseWriter, r *http.Request) {

}

func (app *application) recipeCreateTemp(w http.ResponseWriter, r *http.Request) {

}
func (app *application) recipeShowTemp(w http.ResponseWriter, r *http.Request) {

}

func (app *application) loginTemp(w http.ResponseWriter, r *http.Request) {
	app.render(w, r, "login.page.tmpl", app.addDefaultData(&templateData{
		Form: forms.New(nil)}, r))
}

func (app *application) createRecipe(w http.ResponseWriter, r *http.Request) {

}

func (app *application) getRecipeId(w http.ResponseWriter, r *http.Request) {

}

func (app *application) getRecipes(w http.ResponseWriter, r *http.Request) {

}

func (app *application) deleteRecipeId(w http.ResponseWriter, r *http.Request) {

}

func (app *application) deleteRecipes(w http.ResponseWriter, r *http.Request) {

}

func (app *application) updateRecipe(w http.ResponseWriter, r *http.Request) {

}

func (app *application) signupTemp(w http.ResponseWriter, r *http.Request) {
	app.render(w, r, "signup.page.tmpl", app.addDefaultData(&templateData{
		Form: forms.New(nil)}, r))
}
func (app *application) signupUser(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}

	form := forms.New(r.PostForm)
	form.Required("name", "email", "password")
	form.MatchesPattern("email", forms.EmailRX)
	form.MinLength("password", 10)

	if !form.Valid() {
		app.render(w, r, "signup.page.tmpl", app.addDefaultData(&templateData{Form: form}, r))
		return
	}

	err = app.dbModel.InsertUser(form.Get("name"), form.Get("email"), form.Get("password"))
	if err == models.ErrDuplicateEmail {
		form.Errors.Add("email", "Address is already in use")
		app.render(w, r, "signup.page.tmpl", app.addDefaultData(&templateData{Form: form}, r))
		return
	} else if err != nil {
		app.serverError(w, err)
		return
	}

	app.session.Put(r, "flash", "Your signup was successful. Please log in.")

	http.Redirect(w, r, "/user/login", http.StatusSeeOther)
}

func (app *application) login(w http.ResponseWriter, r *http.Request) {
	err := r.ParseForm()
	if err != nil {
		app.clientError(w, http.StatusBadRequest)
		return
	}
	// Check whether the credentials are valid. If they're not, add a generic error // message to the form failures map and re-display the login page.
	form := forms.New(r.PostForm)
	id, err := app.dbModel.Authenticate(form.Get("email"), form.Get("password"))
	if err != nil {
		if errors.Is(err, models.ErrInvalidCredentials) {
			form.Errors.Add("generic", "Email or Password is incorrect")
			app.render(w, r, "login.page.tmpl", app.addDefaultData(&templateData{Form: form}, r))
			return
		} else {
			form.Errors.Add("generic", "no matching record found")
			app.render(w, r, "login.page.tmpl", app.addDefaultData(&templateData{Form: form}, r))
			return
		}
	}
	// Add the ID of the current user to the session, so that they are now 'logged // in'.
	app.session.Put(r, "authenticatedUserID", id)
	// Redirect the user to the create snippet page.
	http.Redirect(w, r, "/", http.StatusSeeOther)
}
func (app *application) logout(w http.ResponseWriter, r *http.Request) {
	// Remove the authenticatedUserID from the session data so that the user is
	// 'logged out'.
	app.session.Remove(r, "authenticatedUserID")
	// Add a flash message to the session to confirm to the user that they've been // logged out.
	app.session.Put(r, "flash", "You've been logged out successfully!")
	http.Redirect(w, r, "/user/login", http.StatusSeeOther)
}
