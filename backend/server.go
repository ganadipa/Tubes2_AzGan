package main

import (
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "time"
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

// GraphResult could be any structure that represents the result of the operation
type GraphResult struct {
}

func main() {
    http.HandleFunc("/", handlePostRequest)
    log.Println("Listening on http://localhost:8000/")
    if err := http.ListenAndServe(":8000", nil); err != nil {
        log.Fatal(err)
    }
}

func handlePostRequest(w http.ResponseWriter, r *http.Request) {
    startTime := time.Now()
    if r.Method != "POST" {
        respondWithJSON(w, http.StatusMethodNotAllowed, ExpectedResponse{OK: false})
        return
    }

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

	// logic here to set the result

    var result GraphResult
    response := ExpectedResponse{
        Data:                &result,
        Time:                int64(time.Since(startTime) / time.Millisecond),
        DegreesOfSeparation: 5, // Example value
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