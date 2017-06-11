package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
)

//
// Copied from Net
//

func checkErr(err error) {
	if err != nil {
		panic(err)
	}
}

//
// Switch
//

func index(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "It works!\n")
}

func putRoute(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	w.WriteHeader(http.StatusOK)
	data, _ := ioutil.ReadAll(r.Body)
	data_str := string(data)
	fmt.Printf("put route: %v\n", vars["id"])
	fmt.Println("-------- BEGIN DATA --------")
	fmt.Println(data_str)
	fmt.Println("-------- END DATA --------")
}

func getRoute(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	// XXX placeholder
	fmt.Fprintf(w, "[{\"latitude\":50.050,\"longitude\":19.936},{\"latitude\":50.053,\"longitude\":19.937},{\"latitude\":50.055,\"longitude\":19.934},{\"latitude\":50.061,\"longitude\":19.932},{\"latitude\":50.064,\"longitude\":19.931},{\"latitude\":50.068,\"longitude\":19.926},{\"latitude\":50.071,\"longitude\":19.920}]")
}

func getRouteList(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	// XXX placeholder
	fmt.Fprintf(w, "[\"placeholder 1\",\"placeholder_2\"]")
}

//
// Main
//

func main() {
	db, err := sql.Open("mysql", "muchomorek:WesoleMuchomorki256@tcp(85.10.205.173:3306)/muchomorek?charset=utf8")
	checkErr(err)

	r := mux.NewRouter()
	r.HandleFunc("/", index).Methods("GET")
	r.HandleFunc("/routes/{id}", putRoute).Methods("PUT")
	r.HandleFunc("/routes/{id}", getRoute).Methods("GET")
	r.HandleFunc("/routes/", getRouteList).Methods("GET")
	http.ListenAndServe(":8000", r)

	db.Close()
}

// vim: noet
