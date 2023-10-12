package main

import (
	"os"

	"github.com/MyriadFlow/smartcontracts/api"
	"github.com/MyriadFlow/smartcontracts/api/config"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	var dir, _ = os.Getwd()
	config.Dir = dir
	router := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true

	api.ApplyRoutes(router)
	router.Use(cors.New(config))
	router.Run(":8080")
}
