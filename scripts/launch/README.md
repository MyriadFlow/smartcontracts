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
        "param1" : "0x83AD8ddAdb013fbA80DE0d802FD4fB1a949AD79f" // storefrontAdmin wallet
    }
}
```

`TradeHub Contract`

```shell
{
    "contractName" : "TradeHub",
    "constructorParams":{
        "param1":   30, // PlaformFee
        "param2" : "NFT BAZAAR", // TradeHub Name
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC" // AccessMaster Address
    }
}
```

`FusionSeries Contract`

```shell
{
    "contractName" : "FusionSeries",
    "constructorParams":{
        "param1":  "www.xyz.com", //BaseURI
        "param2" : "NFT MELA", // Name
        "param3" : "NFM", // Symbol
        "param2" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298",//TradeHub Address
        "param3" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"//AccessMaster Address
    }
}
```

`SignatureSeries Contract`

```shell
{
    "contractName" : "SignatureSeries",
    "constructorParams":{
        "param1" : "NFT Baazar", // Name
        "param2" : "NFB",// Symbol
        "param3" : "Voucher-Domain",// Domain
        "param4" : "1",// Version
        "param5" : "1000000000000000000",// NFT Price for Lazy minting
        "param6" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298", // TradeHub Address
        "param7" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC"// AccessMaster Address
    }
}

```

`InstaGen Contract`

```shell
{
    "contractName" : "InstaGen",
    "constructorParams":{
        "param1": "NFT MELA",//Name
        "param2" : "NM",//Symbol
        "param3" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298", // TradeHub Address
        "param4" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC" , // AccessMaster Address
        "param5" :"1000000000000000000", // SalePrice
        "param6" : "100000000000000000",// PreSalePrice
        "param7" : 0,//CountDown
        "param8" : 2000,// MaxSupply
        "param9" : 300,//Royalty Percentage
        "param10": "www.abc.com"// BaseUri
    }
}
```

`EternumPass Contract`

```shell
{
    "contractName" : "EternumPass",
    "constructorParams":{
        "param1" : "NFT_MELA",//Name
        "param2" : "NFM",//Symbol
        "param3" : "www.xyz.com",//BaseUri
        "param4" : "100000000000000000",//PublicSalePrice
        "param5" : "30",//PlatformFee
        "param6" : "10000000000000",//Subscription Price
        "param7" : "500",//Royalty
        "param8" : "0xEFf4209584cc2cE0409a5FA06175002537b055DC",//AccessMaster Address
        "param9" : "0x1B8683e1885B3ee93524cD58BC10Cf3Ed6af4298" // TradeHub Address
    }
}
```

`EternalSoul Contract`

```shell
{
    "contractName" : "EternalSoul",
    "constructorParams":{
        "param1" : "Soul Wizard",//Name
        "param2" : "SW",//Symbol
        "param3" : "www.xyz.com", //BaseUri
        "param4" : "Voucher-Domain", //Domain
        "param5" : "1", //Version
        "param6" : "1000000000000000000", //Nft price for Lazyminting
        "param7" : "0xb4f7ba8C7d818a208Cd89B127a126DD2aa45aDae"// AccessMaster Address
    }
}
```

`Phygital`

```shell
{
    "contractName" : "Phygital",
    "constructorParams":{
        "param1":   "Alice Clothing",
        "param2" : "AC",
        "param3" : "0x3A29EA5Ee6AB0326D72b55837dD9fD45b7a867Dd", - TradeHub
        "param4" : "0xc3fE1c3bCCE02d7A115Df2d4737137A15ff830F9" - AccessMaster
    }
}
```

`PhygitalA`

```shell
{
    "contractName" : "PhygitalA",
    "constructorParams":{
        "param1": "Alice Clothing",
        "param2" : "AC",
        "param3" : "0x3A29EA5Ee6AB0326D72b55837dD9fD45b7a867Dd" , //tradehub
        "param4" : "0xc3fE1c3bCCE02d7A115Df2d4737137A15ff830F9", // accessmaster
        "param5" : "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747", // stablecoin address
        "param6" : "["10000000000000000",100,300,6]", // stablecoin address
        "param7" : "www.xyz.com"
    }
}
```

`FlowSubscription Contract`

```shell
{
    "contractName" : "FlowSubscription",
    "constructorParams":{
        "param1" : "MYRIADFLOW",
        "param2" : "MFW",
        "param3" : "www.xyz.com",
        "param4" : "1000000000000000000",
        "param5" : "1000000000000000",
        "param6" : 300,
        "param7" : "0xb4f7ba8C7d818a208Cd89B127a126DD2aa45aDae"
    }
}
```

`CyberMaven Contract`

```shell
{
    "contractName" : "CyberMaven",
    "constructorParams":{

    }
}
```

`CyberMaven Registry`

```shell
{
    "contractName" : "CyberMavenRegistry",
    "constructorParams":{
        "param1" : "0x5FbDB2315678afecb367f032d93F642f64180aa3"
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
