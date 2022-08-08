# marketplace-contracts

Smart Contracts for NFT Marketplace

You'll find here the NFT contracts, tests for that contract, a script that deploys those contracts. It also comes with a variety of other tools, preconfigured to work with the project code.

## Installation

1. Clone the repo by using

```shell
git clone https://github.com/TheLazarusNetwork/marketplace-contracts.git
```

2. Install the dependencies by using the command `npm install`.
   This way your environment will be reproducible, and you will avoid future version conflicts.

## Configuration

1. Rename the file `.env.example` to `.env`
2. Update the values of the given parameters:

```shell
ETHERSCAN_API_KEY=
POLYGONSCAN_API_KEY=
ROPSTEN_URL=
RINKEBY_RPC_URL=
MATICMUM_RPC_URL=
ETHEREUM_RPC_URL=
MNEMONIC=
```

3. `ETHERSCAN_API_KEY` is required to verify the contract deployed on the blockchain network. Since we're using the Polygon Testnet, We need to get the API key from `https://polygonscan.com`

4. Next we need to update the RPC URL based on the network of our choice. Since we have chosen the Polygon Testnet, we need to provide `MATICMUM_RPC_URL` from
   the `https://alchemy.com` or `https://infura.io`. In case if we choose, Rinkeby or Ropsten, we need to update their respective RPC URLs.

5. Lastly we need to provide the wallet from which the gas will be deducted in order to deploy the smart contract. We provide the `MNEMONIC` i.e., The seed words from the ETH wallet/metamask to pay for the transaction. Ensure that there are enough funds in the wallet to pay for the transaction.

## Compiling the contract

Next, if you take a look at `contracts/`, you should be able to find `Creatify.sol` & `Marketplace.sol` and the `Rarible` Royalties Library.

Compile the smart contract by using

```shell
npx hardhat compile
```

## Testing the contract

This project has tests that uses `@openzeppelin/test-helpers`. If we take a look at `test/`, you should be able to find various `test.js`.

To run the tests, we can use command:

```shell
npx hardhat test
```

## Deploying the contract

Next, to deploy the contract we will use a Hardhat script. Inside `scripts/` we use `deploy.js` and run it with

```shell
npx hardhat run --network maticmum scripts/deploy.js
```

## Contract deployments

> `Marketplace Deployed to: 0x16225998d1A6C0826DE1Ba8070B76762E2aCc452`

> `Creatify Deployed to: 0xEAdb190d193B545B74139fD5dc2dDF5CEEAbac00`

## Etherscan verification

To try out Etherscan verification, we need to deploy a contract to an Ethereum network that's supported by Etherscan, such as `Polygon Testnet - maticmum`.
Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network maticmum --constructor-args MarketplaceArguments.js DEPLOYED_CONTRACT_ADDRESS
npx hardhat verify --network maticmum --constructor-args CreatifyArguments.js DEPLOYED_CONTRACT_ADDRESS
```

where `MarketplaceArguments.js` & `CreatifyArguments.js` is a javascript module that exports the argument list.

[Creatify contract](https://mumbai.polygonscan.com/address/0xEAdb190d193B545B74139fD5dc2dDF5CEEAbac00#code)

[Marketplace contract](https://mumbai.polygonscan.com/address/0x16225998d1A6C0826DE1Ba8070B76762E2aCc452#code)

Finally, visit the contract address on the Blockchain Explorer (PolygonScan) and interact with the smart contract at section `Read Contract` and `Write Contract`

# Quick deployment

Run

```bash
GRAPH_NODE_URL=https://xyz/ \
GRAPH_DEPLOY_VERSION=vx.y.z \
GRAPH_IPFS_URL=https://xyz/ \
./deploy.sh
```
