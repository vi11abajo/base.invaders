/**
 * Smart contract addresses on Base Mainnet
 *
 * Update these after deploying contracts
 */

export const CONTRACTS = {
  gameStarter: process.env.NEXT_PUBLIC_GAME_STARTER_ADDRESS as `0x${string}` || '0x',
} as const;

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
