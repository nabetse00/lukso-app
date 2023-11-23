import { HardhatUserConfig } from 'hardhat/config';
import { config as LoadEnv } from 'dotenv';
import '@nomicfoundation/hardhat-toolbox';
// import "@nomicfoundation/hardhat-ethers";
// import "@nomiclabs/hardhat-etherscan";
import 'hardhat-dependency-compiler';
import "hardhat-contract-sizer";
import "hardhat-gas-reporter"

LoadEnv();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.22',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
    ]
  },
  networks: {
    hardhat: {
      chainId: 4201 // mimic testnet
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      // or url: "http://localhost:8545/",
    },
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      chainId: 4201,
      accounts: [process.env.TESTNET_EOA_PRIVATE_KEY as string],
    },
  },
  sourcify: {
    enabled: false,
  },
  etherscan: {
    // no API is required to verify contracts
    // via the Blockscout instance of LUKSO Testnet
    apiKey: "no-api-key-needed",
    customChains: [
      {
        network: "luksoTestnet",
        chainId: 4201,
        urls: {
          apiURL: "https://api.explorer.execution.testnet.lukso.network/api",
          browserURL: "https://explorer.execution.testnet.lukso.network",
        },
      },
    ],
  },
  dependencyCompiler: {
    paths: [
      '@openzeppelin/contracts/token/ERC20/IERC20.sol',
      "@openzeppelin/contracts/interfaces/IERC1271.sol",
      "@lukso/lsp-smart-contracts/contracts/UniversalProfile.sol",
    ],
  },
  gasReporter: {
    currency: 'EUR',
    coinmarketcap: process.env.COINBASE_API_KEY,
    enabled: (process.env.REPORT_GAS) ? true : false,
    outputFile: "report-gas-lukso.txt",
    noColors: true,
    // for lukso mainet estimation
    token: "LYX",
    gasPrice: 2, // nov 23 => was between 1-2 Gwei 12s per block 
  }
};

export default config;
