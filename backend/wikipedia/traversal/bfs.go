package traversal

import (
	"fmt"
	"wikirace/semaphore"
	"wikirace/wikipedia/crawling"
)

const maxWorkers int = 500

// Returns
// - Closest distance between source and destination
// - The tree representation (All edges but the ones connecting to the destination)
// - The nodes of the tree that have a link to the destination
func MultiPathBFS(source, destination string) (int, map[string]string, []string) {
	var distances = make(map[string]int)
	var tree = make(map[string]string)
	var solutions []string
	var data = make(map[string][]string)
	var request_sem = semaphore.NewSemaphore(maxWorkers)
	ch := make(chan crawling.CrawlResult, 120000)

	queue := Queue{}
	queue.Enqueue(source)
	distances[source] = 0
	go func() {
		defer func() { request_sem.Release() }()
		request_sem.Acquire()
		result := crawling.Crawl(source)
		ch <- result
	}()

	currentDepth, found, closest_distance := 0, false, 0

	for !found {
		fmt.Printf("Searching depth %d...\n", currentDepth)
		size := queue.len()

		for range size {
			crawlResult, ok := <-ch
			if !ok {
				panic("The goroutine panicked")
			} else {
				data[crawlResult.Name] = crawlResult.Links
			}
		}

		for range size {
			curr := queue.Dequeue()
			curr_dist := distances[curr]

			for _, neighbour := range data[curr] {
				if _, ok := distances[neighbour]; ok {
					continue
				}
				if neighbour == destination {
					fmt.Printf("Found solution %s\n", curr)
					found = true
					closest_distance = curr_dist + 1
					solutions = append(solutions, curr)
					break
				}
				queue.Enqueue(neighbour)
				tree[neighbour] = curr //neighbour  = child, curr = parent
				distances[neighbour] = curr_dist + 1
				go func(neighbour string) {
					defer func() { request_sem.Release() }()
					request_sem.Acquire()
					result := crawling.Crawl(neighbour)
					ch <- result
				}(neighbour)
			}
		}
		currentDepth++
	}
	fmt.Printf("Total nodes: %d & %d\n", len(data), len(distances))
	return closest_distance, tree, solutions
}

func SingePathBFS(source, destination string) (int, map[string]string, string) {
	var distances = make(map[string]int)
	var tree = make(map[string]string)
	var data = make(map[string][]string)
	var request_sem = semaphore.NewSemaphore(maxWorkers)
	ch := make(chan crawling.CrawlResult, 120000)

	queue := Queue{}
	queue.Enqueue(source)
	distances[source] = 0
	go func() {
		defer func() { request_sem.Release() }()
		request_sem.Acquire()
		result := crawling.Crawl(source)
		ch <- result
	}()

	currentDepth, found, closest_distance := 0, false, 0

	for !found {
		fmt.Printf("Searching depth %d...\n", currentDepth)
		size := queue.len()

		for range size {
			crawlResult, ok := <-ch
			if !ok {
				panic("The goroutine panicked")
			} else {
				data[crawlResult.Name] = crawlResult.Links

			}
		}

		for range size {
			curr := queue.Dequeue()
			curr_dist := distances[curr]

			for _, neighbour := range data[curr] {
				if _, ok := distances[neighbour]; ok {
					continue
				}
				if neighbour == destination {
					fmt.Printf("Found solution %s\n", curr)
					found = true
					closest_distance = curr_dist + 1
					return closest_distance, tree, curr
					// break
				}
				queue.Enqueue(neighbour)
				tree[neighbour] = curr //neighbour  = child, curr = parent
				distances[neighbour] = curr_dist + 1
				go func(neighbour string) {
					defer func() { request_sem.Release() }()
					request_sem.Acquire()
					result := crawling.Crawl(neighbour)
					ch <- result
				}(neighbour)
			}
		}
		currentDepth++
	}
	fmt.Printf("Total nodes: %d & %d\n", len(data), len(distances))
	return closest_distance, tree, ""
}
