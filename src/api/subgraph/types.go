package subgraph

type DeploySubgraphPayload struct {
	Name      string     `json:"name"`
	Folder    string     `json:"folder"`
	NodeUrl   string     `json:"nodeUrl"`
	IpfsUrl   string     `json:"ipfsUrl"`
	Contracts []contract `json:"contracts"`
	Network   string     `json:"network"`
	Protocol  string     `json:"protocol"`
	Tag       string     `json:"tag"`
}
type contract struct {
	Name        string `json:"name"`
	Address     string `json:"address"`
	BlockNumber int    `json:"blockNumber"`
}
