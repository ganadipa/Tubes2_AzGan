package crawling

import (
	"fmt"
	"log"
	"github.com/PuerkitoBio/goquery"
	"net/http"
	// "math/rand"
	// "time"
)

type CrawlResult struct {
	Name string
	Links []string
}

func Crawl(name string) CrawlResult {
	url := fmt.Sprintf("https://wikipedia.org/wiki/%s", name)

	// Make an HTTP GET request to the URL
	response, err := http.Get(url)
	if err != nil {
		log.Fatal("Error fetching URL:", err)
	}
	defer response.Body.Close()

	// Load the HTML document
	doc, err := goquery.NewDocumentFromReader(response.Body)
	if err != nil {
		log.Fatal("Error loading HTML:", err)
	}

	var result_set = make(map[string]bool)

	// Find the <div> with id "bodyContent" and loop through its <a> tags
	doc.Find("#bodyContent a").Each(func(i int, s *goquery.Selection) {
		// Get the href attribute of the <a> tag
		link, exists := s.Attr("href")
		if exists && len(link) >= 6 && link[:6] == "/wiki/" {
			result_set[link[6:]] = true
		}
	})

	var result_array []string

	for name := range result_set {
		result_array = append(result_array, name)
	}

	return CrawlResult{ name, result_array }
}
