import { config as dotenvConfig } from "dotenv";
import "@nomicfoundation/hardhat-verify";

dotenvConfig({ path: '.env.local' });

// Helper function to validate and get accounts
function getAccounts() {
  const key = process.env.DEPLOYER_PRIVATE_KEY;
  if (!key || key === 'your_private_key_here' || key.length < 64) {
    return [];
  }
  return [key.startsWith('0x') ? key : `0x${key}`];
}

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Base Mainnet
    base: {
      type: 'http',
      url: process.env.BASE_RPC_URL || "https://mainnet.base.org",
      accounts: getAccounts(),
      chainId: 8453,
    },
    // Base Sepolia Testnet
    baseSepolia: {
      type: 'http',
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: getAccounts(),
      chainId: 84532,
    },
  },
  etherscan: {
    apiKey: {
      base: process.env.BASESCAN_API_KEY || "",
      baseSepolia: process.env.BASESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
