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


// Testnet: sepolia, mumbai, linea, fevm, binance
// Mainnet: Ethereum, Polygon, Linea, FEVM, Binance 



// API_KEY & PRIVATE_KEY
const MATICMUM_RPC_URL = process.env.MATICMUM_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/api-key"
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ETH-RPC-URL"
const LINEA_GOERLI_RPC_URL = process.env.LINEA_GOERLI_RPC_URL || "https://linea-goerli.infura.io/v3/api-key"
const FILECOIN_CALIBARATION_RPC_URL = process.env.FILECOIN_CALIBARATION_RPC_URL || "https://rpc.ankr.com/filecoin_testnet"
const BNB_TESTNET_RPC_URL = process.env.BNB_TESTNET_RPC_URL || "https://bsc-testnet.public.blastapi.io"
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/api-key"
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/api-key"
const LINEA_RPC_URL = process.env.LINEA_RPC_URL || "https://linea-mainnet.infura.io/v3/api-key"
const FILECOIN_RPC_URL = process.env.FILECOIN_RPC_URL  || "https://filecoin-mainnet.chainstacklabs.com/rpc/v1"
const BNB_RPC_URL = process.env.BNB_RPC_URL || "https://bsc.blockpi.network/v1/rpc/public"

const MNEMONIC = process.env.MNEMONIC || "ajkskjfjksjkf ssfaasff asklkfl klfkas dfklhao asfj sfk klsfjs fkjs"
const PRIVATE_KEY = process.env.PRIVATE_KEY

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "KG1VJQJZVNR4AJU7QIWAKXGC78PCN9UGIK"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Etherscan API key"


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
    sepolia: {
      networkId: 11155111,
      url: SEPOLIA_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
     lineaGoerli :{
      networkId: 59140,
      url: LINEA_GOERLI_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },      
    },
    filecoinCalibaration :{
      networkId: 314159,
      url: FILECOIN_CALIBARATION_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    bnbTest :{
      networkId: 97,
      url: BNB_TESTNET_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    ethereum: {
      networkId: 1,
      url: ETHEREUM_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    polygon: {
      networkId: 137,
      url: POLYGON_RPC_URL,
      // accounts: [`0x${ETH_PRIVATE_KEY}`],
      accounts: {
        mnemonic: MNEMONIC,
      },
    },
    linea :{
      networkId: 59144,
      url: LINEA_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },      
    },
    filecoin :{
      networkId: 314,
      url: FILECOIN_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    bnb:{
      networkId: 56,
      url: BNB_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
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