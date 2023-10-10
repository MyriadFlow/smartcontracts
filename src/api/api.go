package api

import (
	"github.com/MyriadFlow/smartcontracts/api/contracts"
	"github.com/MyriadFlow/smartcontracts/api/roles"
	"github.com/MyriadFlow/smartcontracts/api/subgraph"
	"github.com/gin-gonic/gin"
)

func ApplyRoutes(r *gin.Engine) {
	api := r.Group("/api")
	{
		contracts.ApplyRoutes(api)
		subgraph.ApplyRoutes(api)
		roles.ApplyRoutes(api)
	}
}
