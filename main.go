package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"

	log "github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.GET("/", func(c *gin.Context) {
		jsonData, err := io.ReadAll(c.Request.Body)
		if err != nil {
			return
		}

		filePath := "scripts/launch/launch.json"

		_, err = os.ReadFile(filePath)
		if err != nil {
			fmt.Println("Failed to read file:", err)
			return
		}

		newContent := string(jsonData)

		err = os.WriteFile(filePath, []byte(newContent), 0644)
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
		c.JSON(http.StatusOK, gin.H{"data": `contract is deployed successfully`})
	})
	router.Run(":8080")
}
