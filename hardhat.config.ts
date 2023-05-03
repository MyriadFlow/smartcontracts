require("dotenv").config();
import dotenv from "dotenv"
dotenv.config();
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-truffle5"
import "@nomiclabs/hardhat-waffle"
import "hardhat-gas-reporter"
import "solidity-coverage"

import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'

import { task } from "hardhat/config"

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});
// API_KEY & PRIVATE_KEY
const SEPHOLIA_RPC_URL = process.env.ROPSTEN_RPC_URL || "https://eth-sepholia.alchemyapi.io/v2/your-api-key"
const MATICMUM_RPC_URL = process.env.MATICMUM_RPC_URL || "https://rpc-mumbai.maticvigil.com"
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "https://ETH-RPC-URL"
const PRIVATE_KEY = process.env.PRIVATE_KEY || "mnemonic"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "API Key"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Etherscan API key"

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      initialBaseFeePerGas: 0, // workaround from https://github.com/sc-forks/solidity-coverage/issues/652#issuecomment-896330136 . Remove when that issue is closed.
    },
    maticmum: {
      networkId: 80001,
      url: MATICMUM_RPC_URL,
      accounts: [PRIVATE_KEY]
    },
    ethereum: {
      networkId: 1,
      url: ETHEREUM_RPC_URL,
      accounts: [PRIVATE_KEY]
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: POLYGONSCAN_API_KEY    
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 20000,
  },
};
