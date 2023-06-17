# Working with the API

You can use the API to deploy one of the given contracts on a network

## Sample requests

### deploy instagen contract

##### request type :

```
post
```

##### request url :

```
http://localhost:8080/InstaGen
```

##### request body :

```{
	"data": {
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
},
	"network": "hardhat"
}
```

#### response body :

```
{
    "chainId": 31337,
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "verified": false
}
```

### deploy SignatureSeries contract

##### request type :

```
post
```

##### request url :

```
http://localhost:8080/SignatureSeries
```

##### request body :

```{
	"data": {
    "contractName" : "SignatureSeries",
    "constructorParams":{
        "param1" : "NFT_MELA",
        "param2" : "NFM",
        "param3" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param4" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
},
	"network": "hardhat"
}
```

#### response body :

```
{
    "chainId": 31337,
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "verified": false
}
```

### deploy FusionSeries contract

##### request type :

```
post
```

##### request url :

```
http://localhost:8080/FusionSeries
```

##### request body :

```{
	"data": {
    "contractName" : "FusionSeries",
    "constructorParams":{
        "param1":  "www.xyz.com",
        "param2" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
},
	"network": "hardhat"
}
```

#### response body :

```
{
    "chainId": 31337,
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "verified": false
}
```

### deploy TradeHub contract

##### request type :

```
post
```

##### request url :

```
http://localhost:8080/TradeHub
```

##### request body :

```{
	"data": {
    "contractName" : "TradeHub",
    "constructorParams":{
        "param1":   30,
        "param2" : "NFT BAZAAR",
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
},
	"network": "hardhat"
}
```

#### response body :

```
{
    "chainId": 31337,
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "verified": false
}
```

### deploy FlowAccessControl contract

##### request type :

```
post
```

##### request url :

```
http://localhost:8080/FlowAccessControl
```

##### request body :

```{
	"data": {
    "contractName" : "FlowAccessControl",
    "constructorParams":{
    }
},
	"network": "hardhat"
}
```

#### response body :

```
{
    "chainId": 31337,
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "verified": false
}
```
