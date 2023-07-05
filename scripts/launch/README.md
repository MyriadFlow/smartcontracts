# LAUCH CONTRACT'S

## **Contract Deployment Parameters**

This README file provides an overview of how to fetch contract deployment parameters from a JSON file. The JSON file contains the contract name and constructor parameters required for deploying different contracts. This guide assumes you have a basic understanding of JSON and contract deployment.

## **JSON Format**

The JSON file should have the following format:

**Caution** : Only the parameters should be altered for deployment, not the contract's name in json examples.

`AccessMaster Contract`

```shell
{
    "contractName" : "AccessMaster",
    "constructorParams":{
    }
}
```

`TradeHub Contract`

```shell
{
    "contractName" : "TradeHub",
    "constructorParams":{
        "param1":   30,
        "param2" : "NFT BAZAAR",
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
}
```

`FusionSeries Contract`

```shell
{
    "contractName" : "FusionSeries",
    "constructorParams":{
        "param1":  "www.xyz.com",
        "param2" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
}
```

`SignatureSeries Contract`

```shell
{
    "contractName" : "SignatureSeries",
    "constructorParams":{
        "param1" : "NFT_MELA",
        "param2" : "NFM",
        "param3" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param4" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"
    }
}

```

`InstaGen Contract`

```shell
{
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
}
```

`EternumPass Contract`

```shell
{
    "contractName" : "EternumPass",
    "constructorParams":{
        "param1" : "NFT_MELA",
        "param2" : "NFM",
        "param3" : "www.xyz.com",
        "param4" : "100000000000000000",
        "param5" : "30",
        "param6" : "10000000000000",
        "param7" : "500",
        "param8" : true,
        "param9" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
        "param10" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",
    }
}
```

The `contracts` array contains objects representing each contract. Each contract object has two properties:

-   `contractName`: The name of the contract.
-   `constructorParams`: An array of constructor parameters for the contract.

## **Fetching Parameters**

To fetch the contract deployment parameters from the JSON file, we preferred programming language and JSON parsing library. Here's an example in JavaScript:

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

To launch the contracts using current Json file , use command

```shell
yarn launch --network $NETWORK
```

or

For local deployement

```shell
yarn launch
```

## **Conclusion**

This guide has provided an overview of how to fetch contract deployment parameters from a JSON file. By following these steps, you can easily retrieve the contract name and constructor parameters required for deploying different contracts programmatically.
