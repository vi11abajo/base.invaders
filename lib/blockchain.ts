export const BASE_EXPLORER_URL = 'https://basescan.org';

export function getTransactionUrl(txHash: string): string {
  return `${BASE_EXPLORER_URL}/tx/${txHash}`;
}

export function getAddressUrl(address: string): string {
  return `${BASE_EXPLORER_URL}/address/${address}`;
}
