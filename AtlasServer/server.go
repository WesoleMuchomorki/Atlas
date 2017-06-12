package main

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
//	"io/ioutil"
	"net/http"
	"encoding/json"
	"sort"
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
// Structs
//

type point struct {
	ord int
	Latitude float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

type route struct {
	User string `json:"user"`
	Id int `json:"id"`
	Name string `json:"name"`
}

type routePut struct {
	User string `json:"user"`
	Name string `json:"name"`
	Points []point `json:"points"`
}

//
// Switch
//

func index(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "It works!\n")
}

func putRoute(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	w.WriteHeader(http.StatusOK)

	decoder := json.NewDecoder(r.Body)

	var rt routePut
	err := decoder.Decode(&rt)
	checkErr(err)

	_, err = db.Query(fmt.Sprintf("INSERT INTO trips (name, user_id) VALUES (\"%v\", %v)", rt.Name, rt.User))
	checkErr(err)

	res, err := db.Query(fmt.Sprintf("SELECT id FROM trips WHERE name=\"%v\" AND user_id=%v", rt.Name, rt.User))
	var route_id int

	if res.Next() {
		err = res.Scan(&route_id)
		checkErr(err)

		p := rt.Points[0]

		query := fmt.Sprintf("INSERT INTO points (trip_id, ord, x, y) VALUES (%d, %d, %v, %v)", route_id, 1, p.Latitude, p.Longitude)

		for i := 1; i < len(rt.Points); i++ {
			p := rt.Points[i]

			query += fmt.Sprintf(", (%d, %d, %v, %v)", route_id, i+1, p.Latitude, p.Longitude)
		}

		_, err = db.Query(query)
		checkErr(err)
	}

	defer r.Body.Close()
}

func getRoute(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)

	trip_id := mux.Vars(r)["id"]

	rows, err := db.Query("SELECT ord, x, y FROM points WHERE trip_id = " + trip_id)
	checkErr(err)

	var path []point

	for rows.Next() {
		var p point

		err = rows.Scan(&p.ord, &p.Latitude, &p.Longitude)
		checkErr(err)

		path = append(path,p)
	}

	sort.Slice(path, func(i, j int) bool { return path[i].ord < path[j].ord })

	json_path, _ := json.Marshal(path)

	fmt.Fprintf(w, string(json_path))
}

func getRouteList(db *sql.DB, w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)

	rows, err := db.Query("SELECT trips.id, trips.name, users.name FROM trips JOIN users ON trips.user_id = users.id")

	checkErr(err)

	var list []route

	for rows.Next() {
		var t route

		err = rows.Scan(&t.Id, &t.Name, &t.User)
		checkErr(err)

		list = append(list,t)
	}

	json_list, _ := json.Marshal(list)

	fmt.Fprintf(w, string(json_list))
}

//
// Main
//

func main() {
	db, err := sql.Open("mysql", "muchomorek:WesoleMuchomorki256@tcp(85.10.205.173:3306)/muchomorek?charset=utf8")
	checkErr(err)

	r := mux.NewRouter()
	r.HandleFunc("/", index).Methods("GET")
	r.HandleFunc("/routes/{id}", func(w http.ResponseWriter, r *http.Request) {getRoute(db,w,r)}).Methods("GET")
	r.HandleFunc("/routes/", func(w http.ResponseWriter, r *http.Request) {getRouteList(db,w,r)}).Methods("GET")
	r.HandleFunc("/routes/", func(w http.ResponseWriter, r *http.Request) {putRoute(db,w,r)}).Methods("PUT")
	http.ListenAndServe(":8000", r)

	db.Close()
}

// vim: noet
