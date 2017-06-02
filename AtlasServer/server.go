package main

import (
	_ "github.com/go-sql-driver/mysql"
	"database/sql"
	//	"fmt"
	"io"
	"net/http"
	"strconv"
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

func handler(db *sql.DB, w http.ResponseWriter, r *http.Request) {

	switch r.URL.Query().Get("action") {

	case "list" :
		rows, err := db.Query("SELECT id, name FROM trips")

		checkErr(err)

		for rows.Next() {
			var trip_id int
			var name string

			err = rows.Scan(&trip_id, &name)
			checkErr(err)

			io.WriteString(w, strconv.Itoa(trip_id) + " " + name + "\n")
		}

		break;

	case "get_trip" :
		trip_id := r.URL.Query().Get("trip_id")

		rows, err := db.Query("SELECT ord, x, y FROM points WHERE trip_id = " + trip_id)

		checkErr(err)

		for rows.Next() {
			var ord int
			var x float64
			var y float64

			err = rows.Scan(&ord, &x, &y)
			checkErr(err)

			str_ord := strconv.Itoa(ord)
			str_x := strconv.FormatFloat(x, 'f', 8, 64)
			str_y := strconv.FormatFloat(y, 'f', 8, 64)

			io.WriteString(w, str_ord + " " + str_x + " " + str_y + "\n")
		}
	}
}

//
// Main
//

func main() {
	db, err := sql.Open("mysql", "muchomorek:WesoleMuchomorki256@tcp(85.10.205.173:3306)/muchomorek?charset=utf8")
	checkErr(err)

	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {handler(db,w,r)})
	http.ListenAndServe(":8000", nil)

	db.Close()
}

