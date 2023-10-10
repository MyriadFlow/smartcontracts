package roles

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/MyriadFlow/smartcontracts/api/config"
	"github.com/gin-gonic/gin"
)

func ApplyRoutes(r *gin.RouterGroup) {
	g := r.Group("/Role")
	{
		g.POST("/revoke", RevokeRole)
	}
}

type revokeRoleReq struct {
	Data struct {
		ContractAddr string `json:"contractAddr"`
		WalletAddr   string `json:"walletAddr"`
	}
	Network string `json:"network"`
}

func RevokeRole(c *gin.Context) {
	os.Chdir(config.Dir)
	var req revokeRoleReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	jsonByte, err := json.Marshal(req.Data)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	filePath := "scripts/grantRole.json"

	_, err = os.ReadFile(filePath)
	if err != nil {
		fmt.Println("error reading")
	}

	err = os.WriteFile(filePath, []byte(jsonByte), 0644)
	if err != nil {
		fmt.Println("error writing")

	}

	err = os.Chdir(".")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return

	}

	// Execute the yarn launch command
	cmd := exec.Command("yarn", "grantRole", "--network", req.Network)
	var outb, errb bytes.Buffer
	cmd.Stdout = &outb
	cmd.Stderr = &errb
	err = cmd.Start()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return

	}
	err = cmd.Wait()
	if err != nil {
		log.Printf("Command finished with error: %v", err.Error())
		fmt.Println("out", outb.String())
		fmt.Println("err", errb.String())
		c.JSON(http.StatusInternalServerError, err)
	}
	c.JSON(http.StatusOK, gin.H{"message": "role granted"})
}
