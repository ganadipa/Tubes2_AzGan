package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"slices"
	"sort"
	"strings"
	"time"
	"wikirace/wikipedia/traversal"
)

func HandlePostRequest(w http.ResponseWriter, r *http.Request) {
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

	// logic here to set the result
	closest_distance, tree, solutions := traversal.MultiPathBFS(payload.Source, payload.Target)

	// map id uses label(solution's parent) as the key and the id of each node as its value
	id := make(map[string]int)

	// map depths uses label(solution's parent) as the key and the level of each node as its value
	depths := make(map[string]int)

	// paths is a 2D array that stores the path of each solution
	var paths []Path
	count := 0

	// Initialize id for source
	id[payload.Source] = count
	depths[payload.Source] = 0
	count++

	// Initialize id for request.Target
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
		path = append(path, payload.Source) // Append payload.Source to the path
		slices.Reverse(path)                // Reverse the path
		slices.Reverse(route)               // Reverse the route
		paths = append(paths, route)
	}

	var nodeResult []Node
	for path, i := range id {
		nodeResult = append(nodeResult, Node{
			ID:    i,
			Label: strings.ReplaceAll(path, "_", " "),
			URL:   "https://en.wikipedia.org/wiki/" + strings.ReplaceAll(path, "_", " "),
			Level: depths[path],
		})
	}

	var result GraphResult = GraphResult{
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

func GetRequestHandler(w http.ResponseWriter, r *http.Request) {

	queryParams := r.URL.Query()
	source := queryParams.Get("source")
	target := queryParams.Get("target")
	usingBFS := queryParams.Get("using_bfs")
	allPaths := queryParams.Get("all_paths")

	if source == "" || target == "" || usingBFS == "" || allPaths == "" {
		respondWithJSON(w, http.StatusBadRequest, ExpectedResponse{OK: false})
		return
	}

	if usingBFS != "true" && usingBFS != "false" {
		respondWithJSON(w, http.StatusBadRequest, ExpectedResponse{OK: false})
		return
	}

	if allPaths != "true" && allPaths != "false" {
		respondWithJSON(w, http.StatusBadRequest, ExpectedResponse{OK: false})
		return
	}

	var request GetRequestParams = GetRequestParams{
		Source:   source,
		Target:   target,
		UsingBFS: usingBFS == "true",
		AllPaths: allPaths == "true",
	}

	var response ExpectedResponse
	if request.UsingBFS && !request.AllPaths {
		response = getResponseBFSSinglePath(request)
	} else if request.UsingBFS && request.AllPaths {
		response = getResponseBFS(request)
	} else if !request.UsingBFS && request.AllPaths {
		response = getResponseIDS(request)
	} else {
		response = getResponseIDSSingle(request)
	}

	respondWithJSON(w, http.StatusOK, response)
}

func getResponseBFS(request GetRequestParams) ExpectedResponse {
	startTime := time.Now()

	// logic here to set the result
	closest_distance, tree, solutions := traversal.MultiPathBFS(request.Source, request.Target)

	// map id uses label(solution's parent) as the key and the id of each node as its value
	id := make(map[string]int)

	// map depths uses label(solution's parent) as the key and the level of each node as its value
	depths := make(map[string]int)

	// paths is a 2D array that stores the path of each solution
	var paths []Path
	count := 0

	// Initialize id for source
	id[request.Source] = count
	depths[request.Source] = 0
	count++

	// Initialize id for request.Target
	id[request.Target] = count
	depths[request.Target] = closest_distance
	count++

	for _, solution := range solutions {
		curr := solution
		var path []string
		var route []int
		route = append(route, id[request.Target])
		temp := closest_distance - 1
		for curr != request.Source {
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
		path = append(path, request.Source) // Append request.Source to the path
		slices.Reverse(path)                // Reverse the path
		slices.Reverse(route)               // Reverse the route
		paths = append(paths, route)
	}

	var nodeResult []Node
	for path, i := range id {
		nodeResult = append(nodeResult, Node{
			ID:    i,
			Label: strings.ReplaceAll(path, "_", " "),
			URL:   "https://en.wikipedia.org/wiki/" + strings.ReplaceAll(path, "_", " "),
			Level: depths[path],
		})
	}

	var result GraphResult = GraphResult{
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

	return response
}

func getResponseBFSSinglePath(request GetRequestParams) ExpectedResponse {
	startTime := time.Now()
	// TODO: Integrate to ids algorithms here
	closest_distance, tree, solution := traversal.SingePathBFS(request.Source, request.Target)
	// map id uses label(solution's parent) as the key and the id of each node as its value
	id := make(map[string]int)

	// map depths uses label(solution's parent) as the key and the level of each node as its value
	depths := make(map[string]int)

	// paths is a 2D array that stores the path of each solution
	var paths []Path
	var path []int
	count := 0

	// Initialize id for source
	id[request.Source] = count
	depths[request.Source] = 0
	count++

	// Initialize id for request.Target
	id[request.Target] = count
	depths[request.Target] = closest_distance
	count++

	current := solution
	level := closest_distance - 1

	path = append(path, id[request.Target])

	for current != request.Source {
		id[current] = count
		depths[current] = level
		path = append(path, id[current])
		count++
		level--
		current = tree[current]
	}

	path = append(path, id[request.Source])

	slices.Reverse(path)

	paths = append(paths, path)

	var nodeResult []Node
	for path, i := range id {
		nodeResult = append(nodeResult, Node{
			ID:    i,
			Label: strings.ReplaceAll(path, "_", " "),
			URL:   "https://en.wikipedia.org/wiki/" + strings.ReplaceAll(path, "_", " "),
			Level: depths[path],
		})
	}

	var result GraphResult = GraphResult{
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

	return response
}

func getResponseIDS(request GetRequestParams) ExpectedResponse {
	fmt.Printf("Source: %s\n", request.Source)
	startTime := time.Now()
	// TODO: Integrate to ids algorithms here
	currentDepth, solutions := traversal.MultiPathIDS(request.Source, request.Target)
	// map id uses label(solution's parent) as the key and the id of each node as its value
	id := make(map[string]int)

	// map depths uses label(solution's parent) as the key and the level of each node as its value
	depths := make(map[string]int)

	// paths is a 2D array that stores the path of each solution
	var paths []Path
	count := 0

	// Initialize id for source
	id[request.Source] = count
	depths[request.Source] = 0
	count++

	// Initialize id for request.Target
	id[request.Target] = count
	depths[request.Target] = currentDepth
	count++

	for _, solution := range solutions {
		depth := 0
		for _, path := range solution {
			if path == request.Source || path == request.Target {
				depth++
				continue
			}
			if _, ok := id[path]; ok {
				depth++
				continue
			}
			id[path] = count
			depths[path] = depth
			count++
			depth++
		}
	}

	for _, solution := range solutions {
		var route []int
		route = append(route, id[request.Target])
		for _, path := range solution {
			if path == request.Source || path == request.Target {
				continue
			}
			route = append(route, id[path])
		}
		route = append(route, id[request.Source])
		slices.Reverse(route)
		paths = append(paths, route)
	}

	var nodeResult []Node
	for path, i := range id {
		nodeResult = append(nodeResult, Node{
			ID:    i,
			Label: strings.ReplaceAll(path, "_", " "),
			URL:   "https://en.wikipedia.org/wiki/" + strings.ReplaceAll(path, "_", " "),
			Level: depths[path],
		})
	}

	for _, path := range paths {
		fmt.Println(path)
	}

	for _, node := range nodeResult {
		fmt.Println(node)
	}
	var result GraphResult = GraphResult{
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

	return response
}

func getResponseIDSSingle(request GetRequestParams) ExpectedResponse {
	startTime := time.Now()
	// TODO: Integrate to ids algorithms here
	_, solution := traversal.SinglePathIDS(request.Source, request.Target)
	// map id uses label(solution's parent) as the key and the id of each node as its value
	id := make(map[string]int)

	// map depths uses label(solution's parent) as the key and the level of each node as its value
	depths := make(map[string]int)

	// paths is a 2D array that stores the path of each solution
	var paths []Path
	count := 0
	for _, path := range solution {
		id[path] = count
		depths[path] = count
		count++
	}

	var nodeResult []Node
	for path, i := range id {
		nodeResult = append(nodeResult, Node{
			ID:    i,
			Label: strings.ReplaceAll(path, "_", " "),
			URL:   "https://en.wikipedia.org/wiki/" + strings.ReplaceAll(path, "_", " "),
			Level: depths[path],
		})
	}

	var path []int
	for i := 0; i < len(solution); i++ {
		path = append(path, id[solution[i]])
	}

	paths = append(paths, path)

	var result GraphResult = GraphResult{
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

	return response
}

func respondWithJSON(w http.ResponseWriter, statusCode int, resp ExpectedResponse) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(resp); err != nil {
		fmt.Fprintf(w, "Error encoding response: %v", err)
	}
}
