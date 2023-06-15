package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"os/exec"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func main() {
	const FlowAccessControl = `{
    "contractName" : "FlowAccessControl",
    "constructorParams":{
    }
}`

	const TradeHub = `{
    "contractName" : "TradeHub",
    "constructorParams":{ 
        "param1":   30,
        "param2" : "NFT BAZAAR",
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
}`
	const FusionSeries = `{
    "contractName" : "FusionSeries",
    "constructorParams":{ 
        "param1":  "www.xyz.com",
        "param2" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
}`
	const SignatureSeries = `{
    "contractName" : "SignatureSeries",
    "constructorParams":{ 
        "param1" : "NFT_MELA",
        "param2" : "NFM",
        "param3" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param4" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
}`
	const InstaGen = `{
    "contractName" : "InstaGen",
    "constructorParams":{ 
        "param1": "NFT MELA",
        "param2" : "NM",
        "param3" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param4" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC" ,
        "param5" :"1000000000000000000",
        "param6" : "100000000000000000",
        "param7" : 0,
        "param8" : 2000,
        "param9" : 300,
        "param10": "www.abc.com"
    }
}`
	m := make(map[string]string)

	m["FlowAccessControl"] = FlowAccessControl
	m["TradeHub"] = TradeHub
	m["FusionSeries"] = FusionSeries
	m["SignatureSeries"] = SignatureSeries
	m["InstaGen"] = InstaGen

	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		contract := c.Query("contract")

		filePath := "scripts/launch/launch.json"

		_, err := ioutil.ReadFile(filePath)
		if err != nil {
			fmt.Println("Failed to read file:", err)
			return
		}

		newContent := m[contract]

		err = ioutil.WriteFile(filePath, []byte(newContent), 0644)
		if err != nil {
			fmt.Println("Failed to write to file:", err)
			return
		}

		fmt.Println("File content has been updated.")

		err = os.Chdir(".")
		if err != nil {
			fmt.Println("Failed to change directory:", err)
			return
		}

		// Execute the yarn launch command
		cmd := exec.Command("yarn", "launch")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		err = cmd.Run()
		if err != nil {
			log.WithFields(log.Fields{
				"err": "Failed to execute command",
			}).Error("Failed to execute command")
			c.JSON(http.StatusInternalServerError, gin.H{"data": "Failed to execute command", "error": err})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": contract + ` contract is deployed successfully`})
	})
	router.Run(":8080")
}
