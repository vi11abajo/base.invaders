/**
 * Smart contract addresses on Base network
 * GameStarter: 0x3788852622B3a26A994db11980cBcbEaD6e0D51e
 */

export const CONTRACTS = {
  gameStarter: (process.env.NEXT_PUBLIC_GAME_STARTER_ADDRESS || '0x3788852622B3a26A994db11980cBcbEaD6e0D51e') as `0x${string}`,
} as const;

export const CHAIN_ID = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '8453');
