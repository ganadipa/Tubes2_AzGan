package main

import (
	"fmt"
	"wikirace/wikipedia/traversal"
)

func main() {
	// https://www.sixdegreesofwikipedia.com/?source=Blog&target=Github
	source := "Blog"
	destination := "GitHub"
	closest_distance, solution := traversal.SinglePathIDS(source, destination)

	fmt.Printf("Jarak terdekat antara %s dan %s adalah %d\n", source, destination, closest_distance)
	fmt.Println(solution)
	// fmt.Printf("Ada %d solusi\n", len(solutions))
	// for _, solution := range solutions {
	// 	fmt.Println(solution)
	// }
}

