package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"slices"
	"sort"
	"strings"
	"time"
	"wikirace/wikipedia/traversal"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
)

// SearchPayload defines the structure for the incoming JSON data
type SearchPayload struct {
	Source   string `json:"source"`
	Target   string `json:"target"`
	UsingBFS *bool  `json:"using_bfs"`
	AllPaths *bool  `json:"all_paths"`
}

// ExpectedResponse defines the structure for the outgoing JSON data
type ExpectedResponse struct {
	Data                *GraphResult `json:"data"`
	Time                int64        `json:"time"`
	DegreesOfSeparation int          `json:"degreesOfSeparation"`
	OK                  bool         `json:"ok"`
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
	if payload.Source == "" || payload.Target == "" || payload.UsingBFS == nil || payload.AllPaths == nil {
		respondWithJSON(w, http.StatusOK, ExpectedResponse{OK: false})
		return
	}

	// /*
	// @ganadipa: Below is the dummy data that connects to the front end,
	// replace this with the actual data using azmi's implementation.
	// */
	// result := GraphResult{
	//     Nodes: []Node{
	//         {ID: 0, Label: "Azmi Mahmud Bazeid Kapten Azmi", URL: "https://en.wikipedia.org/wiki/A", Level: 0},
	//         {ID: 1, Label: "B", URL: "https://en.wikipedia.org/wiki/B", Level: 1},
	//         {ID: 2, Label: "C", URL: "https://en.wikipedia.org/wiki/C", Level: 1},
	//         {ID: 3, Label: "D", URL: "https://en.wikipedia.org/wiki/D", Level: 2},
	//         {ID: 4, Label: "E", URL: "https://en.wikipedia.org/wiki/E", Level: 2},
	//         {ID: 5, Label: "F", URL: "https://en.wikipedia.org/wiki/F", Level: 3},
	//     },
	//     Paths: []Path{
	//         {0, 1, 3, 5},
	//         {0, 2, 4, 5},
	//     },
	// }

	// fmt.Println("Request Body:", payload)

	// response := ExpectedResponse{
	//     Data:                &result,
	//     Time:                int64(time.Since(startTime) / time.Millisecond),
	//     DegreesOfSeparation: len(result.Paths[0]),
	//     OK:                  true,
	// }

	// logic here to set the result
	closest_distance, tree, solutions := traversal.BFS(payload.Source, payload.Target)

	// map id uses label(solution's parent) as the key and the id of each node as its value
	id := make(map[string]int)

	// map depths uses label(solution's parent) as the key and the level of each node as its value
	depths := make(map[string]int)

	// map url uses id as the key and the url of each node as its value
	url := make(map[int]string)

	// paths is a 2D array that stores the path of each solution
	var paths []Path
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
			ID:    i,
			Label: strings.ReplaceAll(path, "_", " "),
			URL:   "https://en.wikipedia.org/wiki/" + url[i],
			Level: depths[path],
		})
	}

	// for _, node := range nodeResult {
	// 	fmt.Printf("id %d: label:%s url:%s level:%d \n", node.ID, node.Label, node.URL, node.Level)
	// }

	// for _, path := range paths {
	// 	fmt.Printf("%v\n", path)
	// }

	var result GraphResult
	result = GraphResult{
		Nodes: nodeResult,
		Paths: paths,
	}

	sort.Slice(result.Nodes, func(i, j int) bool {
		return result.Nodes[i].ID < result.Nodes[j].ID
	})

	response := ExpectedResponse{
		Data:                &result,
		Time:                int64(time.Since(startTime) / (time.Millisecond * 1000)),
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
