package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"slices"
	"strings"
	"time"
	"wikirace/wikipedia/traversal"
)

// SearchPayload defines the structure for the incoming JSON data
type SearchPayload struct {
	Source   string `json:"source"`
	Target   string `json:"target"`
	UsingBFS *bool  `json:"using_bfs"`
}

// ExpectedResponse defines the structure for the outgoing JSON data
type ExpectedResponse struct {
	Data                *GraphResult `json:"data"`
	Time                int64        `json:"time"`
	DegreesOfSeparation int          `json:"degreesOfSeparation"`
	OK                  bool         `json:"ok"`
}

// GraphResult could be any structure that represents the result of the operation
type Node struct {
	Id    int    `json:"id"`
	Label string `json:"label"`
	Url   string `json:"url"`
	Level int    `json:"level"`
}

type GraphResult struct {
	Nodes []Node
	Path  [][]int
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
	closest_distance, tree, solutions := traversal.BFS(payload.Source, payload.Target)

	// map id uses label(solution's parent) as the key and the id of each node as its value
	id := make(map[string]int)

	// map depths uses label(solution's parent) as the key and the level of each node as its value
	depths := make(map[string]int)

	// map url uses id as the key and the url of each node as its value
	url := make(map[int]string)

	// paths is a 2D array that stores the path of each solution
	var paths [][]int
	count := 0

	// Initialize id for source
	id[payload.Source] = count
	depths[payload.Source] = 0
	count++

	// Initialize id for destination
	id[payload.Target] = count
	depths[payload.Target] = closest_distance
	count++

	for _, solution := range solutions {
		curr := solution
		var path []string
		var route []int
		route = append(route, id[payload.Target])
		temp := closest_distance - 1
		for curr != payload.Source {
			// Increment id for each path
			if _, ok := id[curr]; ok {
				continue
			}
			route = append(route, count)
			path = append(path, curr)
			id[curr] = count
			depths[curr] = temp
			count++
			temp--
			curr = tree[curr]
		}
		route = append(route, 0)
		path = append(path, payload.Source)                                   // Append payload.Source to the path
		slices.Reverse(path)                                                  // Reverse the path
		slices.Reverse(route)                                                 // Reverse the route
		str := strings.Join(path, "_")                                        // Join the path with "_"
		url[id[solution]] = payload.Source + " " + str + " " + payload.Target // Set the url of the node
		paths = append(paths, route)
	}

	var nodeResult []Node
	for path, i := range id {
		nodeResult = append(nodeResult, Node{
			Id:    i,
			Label: path,
			Url:   url[i],
			Level: depths[path],
		})
	}

	for _, node := range nodeResult {
		fmt.Printf("id %d: label:%s url:%s level:%d \n", node.Id, node.Label, node.Url, node.Level)
	}

	for _, path := range paths {
		fmt.Printf("%v\n", path)
	}

	var result GraphResult
	result = GraphResult{
		Nodes: nodeResult,
		Path:  paths,
	}

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
