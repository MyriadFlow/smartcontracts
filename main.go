package main

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"strings"

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

		err = os.Chdir(".")
		if err != nil {
			fmt.Println("Failed to change directory:", err)
			return
		}

		// Execute the yarn launch command
		out, err := exec.Command("yarn", "launch").Output()
		if err != nil {
			log.WithFields(log.Fields{
				"err": "Failed to execute command",
			}).Error("Failed to execute command")
			c.JSON(http.StatusInternalServerError, gin.H{"data": "Failed to execute command", "error": err})
			return
		}
		ok := strings.Split(string(out), "\n")
		c.JSON(http.StatusOK, gin.H{"data": ok[3:6]})
	})
	router.Run(":8080")
}
