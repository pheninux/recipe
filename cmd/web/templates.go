package main

import (
	"adilhaddad.net/agefice-docs/pkg/forms"
	"adilhaddad.net/agefice-docs/pkg/models"
	"html/template"
	"net/url"
	"path/filepath"
	"time"
)

type templateData struct {
	CurrentYear       int
	FormatDate        func(t time.Time) string
	Flash             string
	AuthenticatedUser *models.User
	IsAuthenticated   bool
	CSRFToken         string
	Form              *forms.Form
	FormData          url.Values
	FormErrors        map[string]string
}

// Create a humanDate function which returns a nicely formatted string
// representation of a time.Time object.
func humainDate(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.UTC().Format("01/02/2006 15:04")
}

func formatDate(date time.Time) string {
	return date.Format("2006-01-02")
}

// Initialize a template.FuncMap object and store it in a global variable. This is
// essentially a string-keyed map which acts as a lookup between the names of our
// custom template functions and the functions themselves.
var functions = template.FuncMap{
	"humainDate": humainDate,
	"formatDate": formatDate,
}

func newTemplateCache(dir string) (map[string]*template.Template, error) {

	// Initialize a new map to act as the cache.
	cache := map[string]*template.Template{}

	// Use the filepath.Glob function to get a slice of all filepaths with
	// the extension '.page.tmpl'. This essentially gives us a slice of all the
	// 'page' templates for the application.
	pages, err := filepath.Glob(filepath.Join(dir, "*.page.tmpl"))

	if err != nil {

		return nil, err
	}

	// Loop through the pages one-by-one.
	for _, page := range pages {

		// Extract the file name (like 'home.page.tmpl') from the full file path
		// and assign it to the name variable.
		name := filepath.Base(page)

		// The template.FuncMap must be registered with the template set before you
		// call the ParseFiles() method. This means we have to use template.New() to
		// create an empty template set, use the Funcs() method to register the
		// template.FuncMap, and then parse the file as normal.
		ts, err := template.New(name).Funcs(functions).ParseFiles(page)
		if err != nil {
			return nil, err
		}
		// Use the ParseGlob method to add any 'layout' templates to the
		// template set (in our case, it's just the 'base' layout at the
		// moment).
		ts, err = ts.ParseGlob(filepath.Join(dir, "*.layout.tmpl"))
		if err != nil {
			return nil, err
		}
		// Use the ParseGlob method to add any 'partial' templates to the
		// template set (in our case, it's just the 'footer' partial at the
		// moment).
		ts, err = ts.ParseGlob(filepath.Join(dir, "*.partial.tmpl"))
		if err != nil {
			return nil, err
		}
		// Add the template set to the cache, using the name of the page
		// (like 'home.page.tmpl') as the key.
		cache[name] = ts

	}
	return cache, nil
}
