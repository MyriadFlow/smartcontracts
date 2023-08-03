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

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// API_KEY & PRIVATE_KEY
const ROPSTEN_RPC_URL = process.env.ROPSTEN_RPC_URL || "https://eth-ropsten.alchemyapi.io/v2/your-api-key"
const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://rpc-mumbai.maticvigil.com"
const MATICMUM_RPC_URL = process.env.MATICMUM_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/tr0pG2ASpL0-Ucmm969f_1yFgDIiAc6y"
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "https://ETH-RPC-URL"
const MNEMONIC = process.env.MNEMONIC || "aisle intact level enter fury shine void access toddler unaware rely erode"
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "KG1VJQJZVNR4AJU7QIWAKXGC78PCN9UGIK"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Etherscan API key"

const PRIVATE_KEY = process.env.PRIVATE_KEY

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
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
      // accounts: [`0x${ETH_PRIVATE_KEY}`],
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    sepholia: {
      networkId: 11155111,
      url: ETHEREUM_RPC_URL,
      accounts : [PRIVATE_KEY],
      // accounts: {
      //   mnemonic: MNEMONIC,
      // },
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      polygonMumbai : POLYGONSCAN_API_KEY,
      sepolia : ETHERSCAN_API_KEY,
    }
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