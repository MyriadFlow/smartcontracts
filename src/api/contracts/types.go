package contracts

type Contract struct {
	Data struct {
		ContractName      string         `json:"contractName"`
		ConstructorParams map[string]any `json:"constructorParams"`
	}
	Network string `json:"network"`
}
