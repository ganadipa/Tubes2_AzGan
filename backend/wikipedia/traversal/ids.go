package traversal

import (
	"fmt"
	"sync"
	"wikirace/semaphore"
	"wikirace/wikipedia/crawling"
)

func dfsCache(node string, currentDepth, requiredDepth int, distances map[string]int, data map[string][]string, request_sem *semaphore.Semaphore, wg *sync.WaitGroup, ch chan crawling.CrawlResult, newNodes *int) {
	// fmt.Println("Still called...")
	if currentDepth == requiredDepth {
		_, ok := distances[node]
		(*newNodes)++
		if !ok {
			panic("Distance should have been recorded before crawled")
		}
		go func() {
			defer func() { request_sem.Release() }()
			request_sem.Acquire()
			result := crawling.Crawl(node)
			ch <- result
		}()
		return
	}

	nodeDistance := distances[node]
	for _, neighbour := range data[node] {
		neighbourDistance, ok := distances[neighbour]
		if !ok {
			panic("Distance of neighbour should have been cached!")
		}
		if nodeDistance+1 == neighbourDistance {
			dfsCache(neighbour, currentDepth+1, requiredDepth, distances, data, request_sem, wg, ch, newNodes)
		}
	}
}

func multiPathDFSsearch(node, destination string, currentDepth, requiredDepth int, distances map[string]int, data map[string][]string, path *[]string, solutions *[][]string) {
	if currentDepth == requiredDepth {
		if node == destination {
			fmt.Println("Found solution")
			copiedSolution := make([]string, len(*path))
			copy(copiedSolution, *path)
			*solutions = append(*solutions, copiedSolution)
		}
		return
	}

	nodeDistance := distances[node]

	for _, neighbour := range data[node] {
		neighbourDistance, ok := distances[neighbour]
		if !ok {
			panic("Distance should have been cached!")
		}
		if nodeDistance+1 == neighbourDistance {
			*path = append(*path, neighbour)
			multiPathDFSsearch(neighbour, destination, currentDepth+1, requiredDepth, distances, data, path, solutions)
			*path = (*path)[:len(*path)-1]
		}
	}
}

func MultiPathIDS(source, destination string) (int, map[string][]string, [][]string) {
	var data = make(map[string][]string)
	var solutions [][]string
	var distances = make(map[string]int)
	var request_sem = semaphore.NewSemaphore(maxWorkers)
	var wg sync.WaitGroup
	ch := make(chan crawling.CrawlResult, 10000)

	distances[source] = 0

	currentDepth := 0
	for {
		fmt.Printf("Seaching depth %d...\n", currentDepth)
		var path []string
		path = append(path, source)
		multiPathDFSsearch(source, destination, 0, currentDepth, distances, data, &path, &solutions)

		if len(solutions) != 0 {
			break
		}

		newNodes := 0
		dfsCache(source, 0, currentDepth, distances, data, request_sem, &wg, ch, &newNodes)
		fmt.Printf("Craling %d links in depth %d\n", newNodes, currentDepth)
		for range newNodes {
			node := <-ch
			data[node.Name] = node.Links
			for _, neighbour := range node.Links {
				if _, ok := distances[neighbour]; !ok {
					distances[neighbour] = currentDepth + 1
				}
			}
		}

		currentDepth++
	}
	return currentDepth, data, solutions
}

func singlePathDFSsearch(node, destination string, currentDepth, requiredDepth int, distances map[string]int, data map[string][]string, path *[]string, isFound *bool) {
	if currentDepth == requiredDepth {
		if node == destination {
			(*isFound) = true
		}
		return
	}

	nodeDistance := distances[node]

	for _, neighbour := range data[node] {
		neighbourDistance, ok := distances[neighbour]
		if !ok {
			panic("Distance should have been cached!")
		}
		if nodeDistance+1 == neighbourDistance {
			*path = append(*path, neighbour)
			singlePathDFSsearch(neighbour, destination, currentDepth+1, requiredDepth, distances, data, path, isFound)
			if *isFound {
				return
			}
			*path = (*path)[:len(*path)-1]
		}
	}
}

func SinglePathIDS(source, destination string) (int,map[string][]string, []string) {
	var data = make(map[string][]string)
	var distances = make(map[string]int)
	var request_sem = semaphore.NewSemaphore(maxWorkers)
	var wg sync.WaitGroup
	ch := make(chan crawling.CrawlResult, 10000)

	distances[source] = 0

	currentDepth := 0
	for {
		fmt.Printf("Seaching depth %d...\n", currentDepth)
		var path []string
		path = append(path, source)
		isFound := false
		singlePathDFSsearch(source, destination, 0, currentDepth, distances, data, &path, &isFound)

		if isFound {
			return currentDepth,data, path
		}

		newNodes := 0
		dfsCache(source, 0, currentDepth, distances, data, request_sem, &wg, ch, &newNodes)
		fmt.Printf("Craling %d links in depth %d\n", newNodes, currentDepth)
		for range newNodes {
			node := <-ch
			data[node.Name] = node.Links
			for _, neighbour := range node.Links {
				if _, ok := distances[neighbour]; !ok {
					distances[neighbour] = currentDepth + 1
				}
			}
		}

		currentDepth++
	}
}
