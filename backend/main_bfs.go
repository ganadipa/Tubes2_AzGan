package main

import (
	"fmt"
	"wikirace/wikipedia/traversal"
)

func main() {
	// https://www.sixdegreesofwikipedia.com/?source=Blog&target=Github
	// source := "Chicken"
	// destination := "Duck"
	source := "Blog"
	destination := "GitHub"

	closest_distance, data, distances := traversal.MultiPathBFS(source, destination)	

	fmt.Printf("Jarak terdekat antara %s dan %s adalah %d\n", source, destination, closest_distance)

	var path []string
	path = append(path, source)
	var solutions [][]string
	traversal.GenerateSolution(source, destination, data, distances, &path, &solutions)

	fmt.Printf("Ada %d solusi\n", len(solutions))
	for i, solution := range solutions {
		fmt.Printf("Solusi ke-%d: ", i + 1)
		fmt.Println(solution)
	}

}

// func printSolution(source, destination string, closest_distance int, tree map[string]string, solutions []string) {
// 	fmt.Printf("Jarak terdekat antara %s dan %s adalah %d\n", source, destination, closest_distance)
// 	for i, solution := range solutions {
// 		var path []string
// 		fmt.Printf("Solution %d: ", i+1)
// 		curr := solution
// 		path = append(path, destination)
// 		for curr != source {
// 			path = append(path, curr)
// 			curr = tree[curr]
// 		}
// 		path = append(path, source)
// 		slices.Reverse(path)
// 		fmt.Printf("%s\n", path)
// 	}
// }
