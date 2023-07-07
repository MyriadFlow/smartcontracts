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

type AccessMaster struct {
	Data struct {
		ContractName      string `json:"contractName"`
		ConstructorParams struct {
		} `json:"constructorParams"`
	}
	Network string `json:"network"`
}
type TradeHub struct {
	Data struct {
		ContractName      string `json:"contractName"`
		ConstructorParams struct {
			Param1 int    `json:"param1"`
			Param2 string `json:"param2"`
			Param3 string `json:"param3"`
		} `json:"constructorParams"`
	}
	Network string `json:"network"`
}
type FusionSeries struct {
	Data struct {
		ContractName      string `json:"contractName"`
		ConstructorParams struct {
			Param1 string `json:"param1"`
			Param2 string `json:"param2"`
			Param3 string `json:"param3"`
		} `json:"constructorParams"`
	}
	Network string `json:"network"`
}
type SignatureSeries struct {
	Data struct {
		ContractName      string `json:"contractName"`
		ConstructorParams struct {
			Param1 string `json:"param1"`
			Param2 string `json:"param2"`
			Param3 string `json:"param3"`
			Param4 string `json:"param4"`
		} `json:"constructorParams"`
	}
	Network string `json:"network"`
}
type InstaGen struct {
	Data struct {
		ContractName      string `json:"contractName"`
		ConstructorParams struct {
			Param1  string `json:"param1"`
			Param2  string `json:"param2"`
			Param3  string `json:"param3"`
			Param4  string `json:"param4"`
			Param5  string `json:"param5"`
			Param6  string `json:"param6"`
			Param7  int    `json:"param7"`
			Param8  int    `json:"param8"`
			Param9  int    `json:"param9"`
			Param10 string `json:"param10"`
		} `json:"constructorParams"`
	}
	Network string `json:"network"`
}

type EternumPass struct {
	Data struct {
		ContractName      string `json:"contractName"`
		ConstructorParams struct {
			Param1  string `json:"param1"`
			Param2  string `json:"param2"`
			Param3  string `json:"param3"`
			Param4  string `json:"param4"`
			Param5  string `json:"param5"`
			Param6  string `json:"param6"`
			Param7  string `json:"param7"`
			Param8  bool   `json:"param8"`
			Param9  string `json:"param9"`
			Param10 string `json:"param10"`
		} `json:"constructorParams"`
	}
	Network string `json:"network"`
}

func main() {
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true

	router.Use(cors.New(config))
	router.POST("/AccessMaster", DeployAccessMaster)
	router.POST("/TradeHub", DeployTradeHub)
	router.POST("/FusionSeries", DeployFusionSeries)
	router.POST("/SignatureSeries", DeploySignatureSeries)
	router.POST("/InstaGen", DeployInstaGen)
	router.POST("/EternumPass", DeployEternumPass)

	router.Use(cors.New(config))
	router.Run(":8080")
}

func DeployTradeHub(c *gin.Context) {
	var req TradeHub
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
func DeployAccessMaster(c *gin.Context) {
	var req AccessMaster
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
func DeployFusionSeries(c *gin.Context) {
	var req FusionSeries
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
func DeploySignatureSeries(c *gin.Context) {
	var req SignatureSeries
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
func DeployInstaGen(c *gin.Context) {
	var req InstaGen
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
func DeployEternumPass(c *gin.Context) {
	var req EternumPass
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
