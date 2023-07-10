package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type Contract struct {
	Data struct {
		ContractName      string         `json:"contractName"`
		ConstructorParams map[string]any `json:"constructorParams"`
	}
	Network string `json:"network"`
}

func main() {
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true

	router.Use(cors.New(config))

	router.POST("/Contract", DeployContract)
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
	log.Printf("Command finished with error: %v", err)
	return outb.Bytes(), nil
}
