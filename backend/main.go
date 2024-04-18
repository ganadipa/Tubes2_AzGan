package main

import (
	"fmt"
	"slices"
	"wikirace/wikipedia/traversal"
)

func main() {
	// https://www.sixdegreesofwikipedia.com/?source=Blog&target=Github
	source := "Blog"
	destination := "GitHub"
	closest_distance, tree, solutions := traversal.BFS(source, destination)

	printSolution(source, destination, closest_distance, tree, solutions)
}

func printSolution(source, destination string, closest_distance int, tree map[string]string, solutions []string) {
	fmt.Printf("Jarak terdekat antara %s dan %s adalah %d\n", source, destination, closest_distance)
	for i, solution := range solutions {
		var path []string
		fmt.Printf("Solution %d: ", i+1)
		curr := solution
		path = append(path, destination)
		for curr != source {
			path = append(path, curr)
			curr = tree[curr]
		}
		path = append(path, source)
		slices.Reverse(path)
		fmt.Printf("%s\n", path)
	}
}
