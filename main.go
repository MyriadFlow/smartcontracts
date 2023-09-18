package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"strconv"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

type Contract struct {
	Data struct {
		ContractName      string         `json:"contractName"`
		ConstructorParams map[string]any `json:"constructorParams"`
	}
	Network string `json:"network"`
}

var dir, _ = os.Getwd()

func main() {
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true

	router.Use(cors.New(config))

	router.POST("/Contract", DeployContract)
	router.POST("/Subgraph", DeploySubgraph)
	router.Use(cors.New(config))
	router.Run(":8080")
}

func DeployContract(c *gin.Context) {
	var req Contract
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	network := req.Network
	jsonByte, err := json.Marshal(req.Data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	response, err := genResponse(jsonByte, network)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, response)

}

func genResponse(jsonByte []byte, network string) ([]byte, error) {
	os.Chdir(dir)
	filePath := "scripts/launch/launch.json"

	_, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Println("error reading")
		return nil, err
	}

	err = os.WriteFile(filePath, []byte(jsonByte), 0644)
	if err != nil {
		fmt.Println("error writing")

		return nil, err
	}

	err = os.Chdir(".")
	if err != nil {
		return nil, err
	}

	// Execute the yarn launch command
	cmd := exec.Command("yarn", "launch", "--network", network)
	var outb, errb bytes.Buffer
	cmd.Stdout = &outb
	cmd.Stderr = &errb
	err = cmd.Start()
	if err != nil {
		return nil, err
	}
	err = cmd.Wait()
	if err != nil {
		log.Printf("Command finished with error: %v", err.Error())
		return nil, err
	}
	return outb.Bytes(), nil
}

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

func DeploySubgraph(c *gin.Context) {
	os.Chdir(dir)
	var req DeploySubgraphPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Invalid request body")
		return
	}

	cmd := exec.Command("graph", "init", req.Name, req.Folder, "--protocol", req.Protocol, "--studio", "-g", req.NodeUrl, "--from-contract", req.Contracts[0].Address, "--contract-name", req.Contracts[0].Name, "--start-block", strconv.Itoa(req.Contracts[0].BlockNumber), "--index-events", "--network", req.Network)
	fmt.Println("cmd: ", cmd)
	var graphout, grapherr bytes.Buffer
	cmd.Stdout = &graphout
	cmd.Stderr = &grapherr
	err := cmd.Start()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Failed to start graph init")
		return
	}
	err = cmd.Wait()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Error in graph init")
		fmt.Println("out: ", graphout.String())
		fmt.Println("err: ", grapherr.String())
		return
	}
	os.Chdir(req.Folder)
	for i := 1; i < len(req.Contracts); i++ {
		cmd := exec.Command("graph", "add", req.Contracts[i].Address, "--contract-name", req.Contracts[i].Name, "--start-block", strconv.Itoa(req.Contracts[i].BlockNumber))
		err := cmd.Start()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			logrus.Error("Failed to start graph add")
			return
		}
		err = cmd.Wait()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			logrus.Error("Error in graph add")
			return
		}
	}

	newcmd := exec.Command("graph", "create", "--node", req.NodeUrl, req.Name)
	err = newcmd.Start()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Error in graph create")
		return
	}
	err = newcmd.Wait()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Failed to run graph create")
		return
	}

	cmd = exec.Command("yarn", "deploy", "-l", "v1", "-i", req.IpfsUrl)
	var outb, errb bytes.Buffer
	cmd.Stdout = &outb
	cmd.Stderr = &errb
	err = cmd.Start()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Failed to deploy graph")
		return
	}
	err = cmd.Wait()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Failed run deploy graph")
		return
	}

	os.Chdir(dir)
	os.RemoveAll(req.Folder)

	c.JSON(http.StatusOK, outb.Bytes())
}
