package subgraph

import (
	"bytes"
	"fmt"
	"math/rand"
	"net/http"
	"os"
	"os/exec"
	"strconv"

	"github.com/MyriadFlow/smartcontracts/api/config"
	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

func ApplyRoutes(r *gin.RouterGroup) {
	g := r.Group("/Subgraph")
	{
		g.POST("", DeploySubgraph)
	}
}

func DeploySubgraph(c *gin.Context) {
	os.Chdir(config.Dir)
	var req DeploySubgraphPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		logrus.Error("Invalid request body")
		return
	}
	nonce := fmt.Sprint(rand.Int())
	cmd := exec.Command("graph", "init", req.Name, nonce, "--protocol", req.Protocol, "--studio", "-g", req.NodeUrl, "--from-contract", req.Contracts[0].Address, "--contract-name", req.Contracts[0].Name, "--start-block", strconv.Itoa(req.Contracts[0].BlockNumber), "--index-events", "--network", req.Network)
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
	os.Chdir(nonce)
	for i := 1; i < len(req.Contracts); i++ {
		cmd := exec.Command("graph", "add", req.Contracts[i].Address, "--contract-name", req.Contracts[i].Name, "--start-block", strconv.Itoa(req.Contracts[i].BlockNumber), "--merge-entities")
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

	cmd = exec.Command("yarn", "deploy", "-l", req.Contracts[0].Name, "-i", req.IpfsUrl)
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
		fmt.Println("out: ", outb.String())
		fmt.Println("err: ", errb.String())
		logrus.Error("Failed run deploy graph")
		return
	}
	fmt.Println(outb.String())
	os.Chdir(config.Dir)
	os.RemoveAll(nonce)

	c.JSON(http.StatusOK, outb.Bytes())
}
