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


// Testnet: sepolia, mumbai, bnbTest , arbGoerli , optiGoerli, baseGoerli
// Mainnet: Ethereum, Polygon,, Binance ,Arbitrum, Optimism,Base
// API_KEY & PRIVATE_KEY

// TESTNET
const MATICMUM_RPC_URL = process.env.MATICMUM_RPC_URL || "https://polygon-mumbai.g.alchemy.com/v2/api-key"
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "https://ETH-RPC-URL"
const BNB_TESTNET_RPC_URL = process.env.BNB_TESTNET_RPC_URL || "https://bsc-testnet.public.blastapi.io"
const ARBITRUM_GOERLI_RPC_URL = process.env.ARBITRUM_GOERLI_RPC_URL || "https://arbitrum-goerli.infura.io/v3/api-key"
const OPTIMISM_GOERLI_RPC_URL = process.env.OPTIMISM_GOERLI_RPC_URL || "https://optimism-goerli.infura.io/v3/api-key"
const BASE_GOERLI_RPC_URL = process.env.BASE_GOERLI_RPC_URL || "https://goerli.base.org"


// MAINNET
const ETHEREUM_RPC_URL = process.env.ETHEREUM_RPC_URL || "https://mainnet.infura.io/v3/api-key"
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-mainnet.g.alchemy.com/v2/api-key"
const BNB_RPC_URL = process.env.BNB_RPC_URL || "https://bsc.blockpi.network/v1/rpc/public"
const ARBITRUM_RPC_URL = process.env.ARBITRUM_RPC_URL || "https://linea-mainnet.infura.io/v3/api-key"
const OPTIMISM_RPC_URL = process.env.OPTIMISM_RPC_URL  || "https://filecoin-mainnet.chainstacklabs.com/rpc/v1"
const BASE_RPC_URL = process.env.BASE_RPC_URL  || "https://filecoin-mainnet.chainstacklabs.com/rpc/v1"



const MNEMONIC = process.env.MNEMONIC || "ajkskjfjksjkf ssfaasff asklkfl klfkas dfklhao asfj sfk klsfjs fkjs"
const PRIVATE_KEY = process.env.PRIVATE_KEY

const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || "lklsdkskldjklgdklkld"
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "Etherscan API key"
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "BSCscan API Key"
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || "Arbiscan API Key"
const OPTISCAN_API_KEY = process.env.OPTISCAN_API_KEY || "Optiscan API Key"
const BASESCAN_API_KEY = process.env.BASESCAN_API_KEY || "Basescan API Key"



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
    // TESTNET NETWORKS
    maticmum: {
      networkId: 80001,
      url: MATICMUM_RPC_URL,
      // accounts: [PRIVATE_KEY],
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
     
    bnbTest :{
      networkId: 97,
      url: BNB_TESTNET_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    arbiGoerli :{
      networkId: 421613,
      url: ARBITRUM_GOERLI_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },      
    },
    optiGoerli :{
      networkId: 420,
      url: OPTIMISM_GOERLI_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    baseGoerli :{
      networkId: 84531,
      url: BASE_GOERLI_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    
    // MAINNET NETWORKS
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
    bnb:{
      networkId: 56,
      url: BNB_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    arbitrum :{
      networkId: 42161,
      url: ARBITRUM_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      },      
    },
    optimism :{
      networkId: 10,
      url: OPTIMISM_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
    base :{
      networkId: 8453,
      url: BASE_RPC_URL,
      // accounts : [PRIVATE_KEY],
      accounts: {
        mnemonic: MNEMONIC,
      }
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: {
      polygonMumbai : POLYGONSCAN_API_KEY,
      sepolia : ETHERSCAN_API_KEY,
      bscTestnet : BSCSCAN_API_KEY,
      optimisticGoerli: OPTISCAN_API_KEY,
      arbitrumGoerli: ARBISCAN_API_KEY,
      baseGoerli: BASESCAN_API_KEY,
    },
    customChains: [
      {
        network: "baseGoerli",
        chainId: 84531,
        urls: {
          apiURL: "https://api-goerli.basescan.org/api",
          browserURL: "https://goerli.basescan.org"
        }
      },
    ]
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