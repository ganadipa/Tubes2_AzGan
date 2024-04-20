package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"

    "github.com/gorilla/mux"
    "github.com/gorilla/handlers"
)

// SearchPayload defines the structure for the incoming JSON data
type SearchPayload struct {
    Source   string  `json:"source"`
    Target   string  `json:"target"`
    UsingBFS *bool   `json:"using_bfs"`
}

// ExpectedResponse defines the structure for the outgoing JSON data
type ExpectedResponse struct {
    Data                 *GraphResult `json:"data"`
    Time                 int64        `json:"time"`
    DegreesOfSeparation  int          `json:"degreesOfSeparation"`
    OK                   bool         `json:"ok"`
}

// Node represents a node in the graph
type Node struct {
    ID    int    `json:"id"`
    Label string `json:"label"`
    URL   string `json:"url"`
    Level int    `json:"level"`
}

// Path represents a path through the graph by node IDs
type Path []int

// GraphResult holds the entire graph information including nodes and paths
type GraphResult struct {
    Nodes []Node `json:"nodes"`
    Paths []Path `json:"paths"`
}



func main() {
    router := mux.NewRouter()
    router.HandleFunc("/", handlePostRequest).Methods("POST")

    // Configure CORS here
    corsHandler := handlers.CORS(
        handlers.AllowedOrigins([]string{"*"}), // Allows all origins
        handlers.AllowedMethods([]string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}),
        handlers.AllowedHeaders([]string{"Content-Type", "X-Requested-With"}), // You might need to adjust headers based on your client needs
        handlers.ExposedHeaders([]string{"Content-Length", "Access-Control-Allow-Origin"}),
        handlers.AllowCredentials(),
    )

    log.Println("Listening on http://localhost:8000/")



    if err := http.ListenAndServe(":8000", corsHandler(router)); err != nil {
        log.Fatal(err)
    }
}

func handlePostRequest(w http.ResponseWriter, r *http.Request) {
    startTime := time.Now()
    var payload SearchPayload
    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
        respondWithJSON(w, http.StatusBadRequest, ExpectedResponse{OK: false})
        return
    }

    // Validate that required fields are not empty
    if payload.Source == "" || payload.Target == "" || payload.UsingBFS == nil {
        respondWithJSON(w, http.StatusOK, ExpectedResponse{OK: false})
        return
    }

    /*
    @ganadipa: Below is the dummy data that connects to the front end, 
    replace this with the actual data using azmi's implementation.
    */
    result := GraphResult{
        Nodes: []Node{
            {ID: 0, Label: "Azmi Mahmud Bazeid Kapten Azmi", URL: "https://en.wikipedia.org/wiki/A", Level: 0},
            {ID: 1, Label: "B", URL: "https://en.wikipedia.org/wiki/B", Level: 1},
            {ID: 2, Label: "C", URL: "https://en.wikipedia.org/wiki/C", Level: 1},
            {ID: 3, Label: "D", URL: "https://en.wikipedia.org/wiki/D", Level: 2},
            {ID: 4, Label: "E", URL: "https://en.wikipedia.org/wiki/E", Level: 2},
            {ID: 5, Label: "F", URL: "https://en.wikipedia.org/wiki/F", Level: 3},
        },
        Paths: []Path{
            {0, 1, 3, 5},
            {0, 2, 4, 5},
        },
    }

    fmt.Println("Request Body:", payload)
    
    response := ExpectedResponse{
        Data:                &result,
        Time:                int64(time.Since(startTime) / time.Millisecond),
        DegreesOfSeparation: len(result.Paths[0]),
        OK:                  true,
    }

    respondWithJSON(w, http.StatusOK, response)
}

func respondWithJSON(w http.ResponseWriter, statusCode int, resp ExpectedResponse) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    if err := json.NewEncoder(w).Encode(resp); err != nil {
        fmt.Fprintf(w, "Error encoding response: %v", err)
    }
}
