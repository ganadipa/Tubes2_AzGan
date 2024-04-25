package traversal

// import "fmt"

func GenerateSolution(node, destination string, data map[string][]string, distances map[string]int, path *[]string, solutions *[][]string) {
	if node == destination {
		copiedSolution := make([]string, len(*path))
		copy(copiedSolution, *path)
		*solutions = append(*solutions, copiedSolution)
		return
	}

	curDepth := distances[node]

	for _, neighbour := range data[node] {
		neighbourDepth := distances[neighbour]
		if neighbourDepth == curDepth + 1 {
			*path = append(*path, neighbour)
			GenerateSolution(neighbour, destination, data, distances, path, solutions)
			*path = (*path)[:len(*path)-1]
		}
	}
}
