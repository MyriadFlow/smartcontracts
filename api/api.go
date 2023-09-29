package api

import (
	"github.com/MyriadFlow/smartcontracts/api/contracts"
	"github.com/gin-gonic/gin"
)

func ApplyRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		contracts.ApplyRoutes(api)
	}
}
