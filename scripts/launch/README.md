# LAUCH CONTRACT'S

## Contract Deployment Parameters

This README file provides an overview of how to fetch contract deployment parameters from a JSON file. The JSON file contains the contract name and constructor parameters required for deploying different contracts. This guide assumes you have a basic understanding of JSON and contract deployment.

## JSON Format

The JSON file should have the following format:

```shell
{
    "contractName" : "FlowMarketplace",
    "constructorParams":{
        "param1":   30,
        "param2" : "NFT BAZAAR",
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DB"
    }
}
```

The `contracts` array contains objects representing each contract. Each contract object has two properties:

- `contractName`: The name of the contract.
- `constructorParams`: An array of constructor parameters for the contract. 

## Fetching Parameters
To fetch the contract deployment parameters from the JSON file,  we  preferred programming language and JSON parsing library. Here's an example in JavaScript:


```shell
const fs = require("fs")

const scripts = `scripts/deploy/deploy.json`
const data = fs.readFileSync(scripts, "utf8")
const jsonContent = JSON.parse(data)

```

Make sure to replace `scripts` with the path to your actual JSON file.


## **Deploying Contracts**

Once you have fetched the contract deployment parameters, you can use them to deploy the contracts using your preferred method or framework. The deployment process will depend on the specific blockchain platform you are using (e.g., Ethereum, Binance Smart Chain, etc.) and the development tools you have chosen (e.g., Truffle, Hardhat, etc.).

Please refer to the documentation or resources provided by your chosen platform and development tools for detailed instructions on deploying contracts programmatically.

## **Conclusion**

This guide has provided an overview of how to fetch contract deployment parameters from a JSON file. By following these steps, you can easily retrieve the contract name and constructor parameters required for deploying different contracts programmatically.