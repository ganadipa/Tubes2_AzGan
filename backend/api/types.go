package api

type SearchPayload struct {
	Source   string `json:"source"`
	Target   string `json:"target"`
	UsingBFS *bool  `json:"using_bfs"`
	AllPaths *bool  `json:"all_paths"`
}

type ExpectedResponse struct {
	Data                *GraphResult `json:"data"`
	Time                int64        `json:"time"`
	DegreesOfSeparation int          `json:"degreesOfSeparation"`
	OK                  bool         `json:"ok"`
}

type Node struct {
	ID    int    `json:"id"`
	Label string `json:"label"`
	URL   string `json:"url"`
	Level int    `json:"level"`
}

type Path []int

type GraphResult struct {
	Nodes []Node `json:"nodes"`
	Paths []Path `json:"paths"`
}

type GetRequestParams struct {
	Source   string
	Target   string
	UsingBFS bool
	AllPaths bool
}
