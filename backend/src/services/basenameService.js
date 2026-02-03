import axios from 'axios';
import { ethers } from 'ethers';

// Base Mainnet RPC
const BASE_RPC_URL = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
const provider = new ethers.JsonRpcProvider(BASE_RPC_URL);

// Basename Registry Contract on Base
const BASENAME_REGISTRY_ADDRESS = '0x03c4738Ee98aE44591e1A4A4F3CaB6641d95DD9a';

// Basename Registry ABI (minimal - just what we need)
const BASENAME_REGISTRY_ABI = [
  'function defaultNames(address addr) view returns (string)',
];

/**
 * Fetch Basename for a wallet address using the registry contract
 * @param {string} address - Wallet address
 * @returns {Promise<{name: string|null, avatar: string|null}>}
 */
export async function getBasename(address) {
  try {
    if (!address) {
      return { name: null, avatar: null };
    }

    // Normalize address
    const normalizedAddress = ethers.getAddress(address);

    // Create contract instance
    const registry = new ethers.Contract(
      BASENAME_REGISTRY_ADDRESS,
      BASENAME_REGISTRY_ABI,
      provider
    );

    // Get the default name for this address
    const basename = await registry.defaultNames(normalizedAddress);

    if (!basename || basename === '') {
      console.log(`📛 No Basename found for ${address}`);
      return { name: null, avatar: null };
    }

    console.log(`✅ Found Basename: ${basename} for ${address}`);

    return {
      name: basename,
      avatar: null
    };
  } catch (error) {
    console.error(`❌ Error fetching Basename for ${address}:`, error.message);
    return { name: null, avatar: null };
  }
}

/**
 * Fetch Basename using the Basename API (fallback method)
 * @param {string} address - Wallet address
 * @returns {Promise<{name: string|null, avatar: string|null}>}
 */
export async function getBasenameFromAPI(address) {
  try {
    // Basename API endpoint
    const response = await axios.get(`https://api.basename.app/v1/name/${address}`, {
      timeout: 2000,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (response.data && response.data.name) {
      console.log(`✅ Found Basename from API: ${response.data.name}`);
      return {
        name: response.data.name,
        avatar: response.data.avatar || null
      };
    }

    return { name: null, avatar: null };
  } catch (error) {
    // Silently fail for API errors (it's just a fallback)
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
  // Always ensure we have a fallback username
  const fallbackUsername = generateDefaultUsername(address);

  try {
    console.log(`🔍 Looking up name for ${address}`);

    // Try contract-based lookup first (with timeout)
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );

    const contractLookup = getBasename(address);
    let result = await Promise.race([contractLookup, timeoutPromise]).catch(() => ({ name: null, avatar: null }));

    // If contract lookup failed, try API as fallback
    if (!result.name) {
      console.log(`🔄 Trying API fallback...`);
      result = await getBasenameFromAPI(address).catch(() => ({ name: null, avatar: null }));
    }

    if (result.name && result.name.trim() !== '') {
      console.log(`✅ Using name: ${result.name}`);
      return { username: result.name, avatar: result.avatar };
    }

    // Fallback to generated username
    console.log(`📛 No name found, using fallback: ${fallbackUsername}`);
    return {
      username: fallbackUsername,
      avatar: null
    };
  } catch (error) {
    console.log(`⚠️ Name lookup failed (${error.message}), using fallback: ${fallbackUsername}`);
    return {
      username: fallbackUsername,
      avatar: null
    };
  }
}
