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
func DeploySubgraphFor(c *gin.Context) {
	os.Chdir(config.Dir)
	var req DeploySubgraphPayload

	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err)
		return
	}

	nonce := fmt.Sprint(rand.Int())
	initArgs := []string{"init", req.Name, nonce, "--protocol", req.Protocol, "--studio", "-g", req.NodeUrl, "--from-contract", req.Contracts[0].Address, "--contract-name", req.Contracts[0].Name, "--start-block", strconv.Itoa(req.Contracts[0].BlockNumber), "--index-events", "--network", req.Network}
	if err := executeCommand("graph", initArgs...); err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error in graph init", err)
		return
	}

	os.Chdir(nonce)
	for i := 1; i < len(req.Contracts); i++ {
		addArgs := []string{"add", req.Contracts[i].Address, "--contract-name", req.Contracts[i].Name, "--start-block", strconv.Itoa(req.Contracts[i].BlockNumber), "--merge-entities"}
		if err := executeCommand("graph", addArgs...); err != nil {
			respondWithError(c, http.StatusInternalServerError, "Error in graph add", err)
			return
		}
	}

	createArgs := []string{"create", "--node", req.NodeUrl, req.Name}
	if err := executeCommand("graph", createArgs...); err != nil {
		respondWithError(c, http.StatusInternalServerError, "Error in graph create", err)
		return
	}

	deployArgs := []string{"deploy", "-l", req.Contracts[0].Name, "-i", req.IpfsUrl}
	if output, err := executeCommandWithOutput("yarn", deployArgs...); err != nil {
		respondWithError(c, http.StatusInternalServerError, "Failed to deploy graph", err)
		fmt.Println("output: ", output)
		return
	} else {
		fmt.Println("output: ", output)
	}

	os.Chdir(config.Dir)
	os.RemoveAll(nonce)
	c.JSON(http.StatusOK, gin.H{"message": "Subgraph deployed successfully"})
}

func respondWithError(c *gin.Context, code int, message string, err error) {
	logrus.Error(message, ": ", err)
	c.JSON(code, gin.H{"error": err.Error()})
}

func executeCommand(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	var out, errb bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &errb
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("%s: %s", err, errb.String())
	}
	if err := cmd.Wait(); err != nil {
		return fmt.Errorf("%s: %s", err, errb.String())
	}
	return nil
}

func executeCommandWithOutput(name string, args ...string) (string, error) {
	cmd := exec.Command(name, args...)
	var out, errb bytes.Buffer
	cmd.Stdout = &out
	cmd.Stderr = &errb
	if err := cmd.Start(); err != nil {
		return "", fmt.Errorf("%s: %s", err, errb.String())
	}
	if err := cmd.Wait(); err != nil {
		return "", fmt.Errorf("%s: %s", err, errb.String())
	}
	return out.String(), nil
}
