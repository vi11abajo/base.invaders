import { ethers } from 'ethers';

// Base Mainnet RPC
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

// L2 Resolver contract address on Base
const L2_RESOLVER_ADDRESS = '0xC6d566A56A1aFf6508b41f6c90ff131615583BCD';

// L2 Resolver ABI (only the functions we need)
const L2_RESOLVER_ABI = [
  'function name(bytes32 node) view returns (string)',
  'function addr(bytes32 node) view returns (address)',
];

/**
 * Convert address to ENS node (namehash)
 * For reverse resolution: addr.reverse
 */
function getNamehash(address) {
  // Normalize address
  const addr = address.toLowerCase().replace('0x', '');
  // Create reverse node: <address>.addr.reverse
  const reverseNode = `${addr}.addr.reverse`;
  return ethers.namehash(reverseNode);
}

/**
 * Fetch Basename for a wallet address
 * @param {string} address - Wallet address
 * @returns {Promise<{name: string|null, avatar: string|null}>}
 */
export async function getBasename(address) {
  try {
    if (!address) {
      return { name: null, avatar: null };
    }

    // Create contract instance
    const resolver = new ethers.Contract(
      L2_RESOLVER_ADDRESS,
      L2_RESOLVER_ABI,
      provider
    );

    // Get the node for reverse resolution
    const node = getNamehash(address);

    // Fetch the name
    const basename = await resolver.name(node);

    if (!basename || basename === '') {
      console.log(`📛 No Basename found for ${address}`);
      return { name: null, avatar: null };
    }

    console.log(`✅ Found Basename: ${basename} for ${address}`);

    // For now, we don't have avatar from L2 resolver
    // Avatar could be fetched from IPFS metadata or NFT metadata if needed
    return {
      name: basename,
      avatar: null // Could be enhanced to fetch avatar from metadata
    };
  } catch (error) {
    console.error('❌ Error fetching Basename:', error.message);
    return { name: null, avatar: null };
  }
}

/**
 * Generate a default username from wallet address
 * @param {string} address - Wallet address
 * @returns {string}
 */
export function generateDefaultUsername(address) {
  return `Player${address.slice(2, 8)}`;
}

/**
 * Get user profile with Basename or fallback to generated username
 * @param {string} address - Wallet address
 * @returns {Promise<{username: string, avatar: string|null}>}
 */
export async function getUserProfile(address) {
  try {
    // Try to get Basename first
    const { name, avatar } = await getBasename(address);

    if (name) {
      return { username: name, avatar };
    }

    // Fallback to generated username
    return {
      username: generateDefaultUsername(address),
      avatar: null
    };
  } catch (error) {
    console.error('❌ Error getting user profile:', error.message);
    return {
      username: generateDefaultUsername(address),
      avatar: null
    };
  }
}
