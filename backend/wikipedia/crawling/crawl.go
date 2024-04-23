package crawling

import (
	"fmt"
	"log"
	"net/http"
	"strings"
	// "time"

	"github.com/PuerkitoBio/goquery"
)

type CrawlResult struct {
	Name string
	Links []string
}

func Crawl(name string) CrawlResult {
	name = strings.Replace(name, "%", "%25", -1)
	wiki_url := fmt.Sprintf("https://en.wikipedia.org/wiki/%s", name)

	// Make an HTTP GET request to the URL
	response, err := http.Get(wiki_url)
	if err != nil {
		log.Fatal("Error fetching URL:", err)
	}

	for response.StatusCode == 429 {				
		// fmt.Printf("Too many requests. %s\n", name)
		response, err = http.Get(wiki_url)
		if err != nil {
			log.Fatal("Error fetching URL:", err)
		}
	}
	defer response.Body.Close()

	// Load the HTML document
	doc, err := goquery.NewDocumentFromReader(response.Body)
	if err != nil {
		log.Fatal("Error loading HTML:", err)
	}

	var result_set = make(map[string]bool)

	// Find the <div> with id "bodyContent" and loop through its <a> tags
	doc.Find("a").Each(func(i int, s *goquery.Selection) {
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
