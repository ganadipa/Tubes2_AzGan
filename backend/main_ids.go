package main

import (
	"fmt"
	"wikirace/wikipedia/traversal"
)

func main() {
	// https://www.sixdegreesofwikipedia.com/?source=Blog&target=Github
	source := "Eriquius"
	destination := "Acregoliath"
	closest_distance, solutions := traversal.MultiPathIDS(source, destination)

	fmt.Printf("Jarak terdekat antara %s dan %s adalah %d\n", source, destination, closest_distance)

	for _, solution := range solutions {
		fmt.Println(solution)
	}
}

