# storefront-contracts

Smart Contracts for MyriadFlow StoreFront

You'll find here the NFT contracts, tests for that contract, a script that deploys those contracts. It also comes with a variety of other tools, preconfigured to work with the project code.

## Installation

1. Clone the repo by using

```shell
git clone https://github.com/MyriadFlow/storefront_contracts.git
```

2. Install the dependencies by using the command `yarn install`.
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

## Compiling Contracts

Next, if you take a look at `contracts/`, you should be able to find `StoreFront.sol` & `Marketplace.sol` and the `Rarible` Royalties Library.

Compile the smart contract by using

```shell
yarn hardhat compile
```

## Testing Contracts

This project has tests that uses `@openzeppelin/test-helpers`. If we take a look at `test/`, you should be able to find various `test.js`.

To run the tests, we can use command:

```shell
yarn test
```

## Deploying Contracts

Next, to deploy the contract we will use a Hardhat script. Inside `scripts/` we use `deploy.js` and run it with

```shell
yarn deploy maticmum
```

## Contract Deployments - V3

> `Marketplace Deployed to: 0xb5599E75A71C8f0FFDc9D2a60809d2F910455c72`

> `StoreFront Deployed to: 0x2E77d56b4376dD1D2e57f4a915048B06522fc107`

## Etherscan Verification

To try out Etherscan verification, we need to deploy a contract to an Ethereum network that's supported by Etherscan, such as `Polygon Testnet - maticmum`.
Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network maticmum --constructor-args MarketplaceArguments.js DEPLOYED_CONTRACT_ADDRESS
npx hardhat verify --network maticmum --constructor-args StoreFrontArguments.js DEPLOYED_CONTRACT_ADDRESS
```

where `MarketplaceArguments.js` & `StoreFrontArguments.js` is a javascript module that exports the argument list.

[Marketplace Contract](https://mumbai.polygonscan.com/address/0xb5599E75A71C8f0FFDc9D2a60809d2F910455c72#code)

[StoreFront Contract](https://mumbai.polygonscan.com/address/0x2E77d56b4376dD1D2e57f4a915048B06522fc107#code)

Finally, visit the contract address on the Blockchain Explorer (PolygonScan) and interact with the smart contract at section `Read Contract` and `Write Contract`

# TheGraph Deployment

```bash
graph init --index-events
graph codegen && graph build
graph auth --product hosted-service $GRAPH_TOKEN
graph deploy --product hosted-service myriadflow/marketplacev1
```

- MarketplaceV1:

Build completed: QmQpztirZ6a2FrLq6GFWj26ai4zjj68T2ZUQpFFoxvmwEc
Deployed to https://thegraph.com/explorer/subgraph/myriadflow/marketplacev1

- StoreFront-V1:

Build completed: QmU1uD3HSYYKE8qUzMgDC7axpxoQPuoQQuUZoE1Y4dJa5r
Deployed to https://thegraph.com/explorer/subgraph/myriadflow/storefront-v1

- Subgraph endpoints:

Queries (HTTP):      https://api.thegraph.com/subgraphs/name/myriadflow/marketplacev1
Queries (HTTP):      https://api.thegraph.com/subgraphs/name/myriadflow/storefront-v

# Quick Deployment

Run

```bash
GRAPH_NODE_URL=https://xyz/ \
GRAPH_DEPLOY_VERSION=vx.y.z \
GRAPH_IPFS_URL=https://xyz/ \
./deploy.sh
```
