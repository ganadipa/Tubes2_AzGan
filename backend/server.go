package main

import (
	"fmt"
	"log"
	"net/http"
	"wikirace/api"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

func main() {
	router := mux.NewRouter()
	log.Println("Listening on http://localhost:8000/")

	// route handling each endpoint.
	router.HandleFunc("/", api.HandlePostRequest).Methods("POST")
	router.HandleFunc("/get", api.GetRequestHandler).Methods("GET")

	// configure CORS.
	corsHandler := handlers.CORS(
		handlers.AllowedOrigins([]string{"*"}),
		handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
		handlers.AllowedHeaders([]string{"Content-Type", "X-Requested-With"}),
		handlers.ExposedHeaders([]string{"Content-Length", "Access-Control-Allow-Origin"}),
		handlers.AllowCredentials(),
	)

	if err := http.ListenAndServe(":8000", corsHandler(router)); err != nil {
		fmt.Println("Error while listening.")
	}
}
