package main

import (
	"encoding/json"
	"net/http"
	"os"
	"os/exec"
	"strings"

	"github.com/gin-gonic/gin"
)

type FlowAccessControl struct {
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
type res struct {
	ChainID         int    `json:"chainId"`
	ContractAddress string `json:"contractAddress"`
	Verified        bool   `json:"verified"`
}

func main() {
	router := gin.Default()
	router.POST("/FlowAccessControl", DeployFlowAccessControl)
	router.POST("/TradeHub", DeployTradeHub)
	router.POST("/FusionSeries", DeployFusionSeries)
	router.POST("/SignatureSeries", DeploySignatureSeries)
	router.POST("InstaGen", DeployInstaGen)
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
func DeployFlowAccessControl(c *gin.Context) {
	var req FlowAccessControl
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
	}

	c.JSON(http.StatusOK, response)
}

func genResponse(jsonByte []byte, network string) (*res, error) {
	jsonData := string(jsonByte)
	filePath := "scripts/launch/launch.json"

	_, err := os.ReadFile(filePath)
	if err != nil {
		return nil, err
	}

	newContent := string(jsonData)

	err = os.WriteFile(filePath, []byte(newContent), 0644)
	if err != nil {
		return nil, err
	}

	err = os.Chdir(".")
	if err != nil {
		return nil, err
	}

	// Execute the yarn launch command
	out, err := exec.Command("yarn", "launch", "--network", network).Output()
	if err != nil {
		return nil, err
	}

	response := new(res)
	arr := strings.Split(string(out), "\n")
	if err := json.Unmarshal([]byte(arr[len(arr)-3]), response); err != nil {
		return nil, err
	}
	return response, nil
}
