// Hook для вызова GameStarter контракта с Transaction Sponsorship
import { useState } from 'react';
import { useAccount, useWaitForTransactionReceipt, usePublicClient, useWalletClient } from 'wagmi';
import { encodeFunctionData, type Address, type Hash } from 'viem';
import { GameStarterABI } from '../contracts/GameStarterABI';
import { CONTRACTS } from '../contracts/contractAddresses';
import { base } from 'wagmi/chains';

export function useGameStart() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [hash, setHash] = useState<Hash | undefined>();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Получить paymaster данные от Base Paymaster API
   */
  const getPaymasterData = async (txData: `0x${string}`, from: Address) => {
    try {
      const response = await fetch('https://api.developer.coinbase.com/rpc/v1/base/paymaster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'pm_getPaymasterData',
          params: [{
            sender: from,
            to: CONTRACTS.gameStarter,
            data: txData,
            value: '0x0',
            chainId: base.id,
          }],
        }),
      });

      const result = await response.json();
      if (result.error) {
        console.warn('⚠️ Paymaster не доступен:', result.error.message);
        return null;
      }

      return result.result;
    } catch (error) {
      console.warn('⚠️ Paymaster запрос не удался:', error);
      return null;
    }
  };

  /**
   * Вызвать startGame() контракта
   * Попытается спонсировать транзакцию, fallback на обычную транзакцию
   */
  const startGame = async () => {
    if (!address || !walletClient || !publicClient) {
      const err = new Error('Wallet not connected');
      setError(err);
      throw err;
    }

    setIsPending(true);
    setError(null);

    try {
      // Подготовить данные транзакции
      const data = encodeFunctionData({
        abi: GameStarterABI,
        functionName: 'startGame',
        args: [],
      });

      // Попытаться получить paymaster данные
      const paymasterData = await getPaymasterData(data, address);

      let txHash: Hash;

      if (paymasterData) {
        // Спонсированная транзакция через paymaster
        console.log('✅ Используется sponsored transaction');
        txHash = await walletClient.sendTransaction({
          account: address,
          to: CONTRACTS.gameStarter,
          data,
          value: 0n,
          chain: base,
          ...paymasterData,
        });
      } else {
        // Fallback: обычная транзакция (пользователь платит gas)
        console.log('ℹ️ Paymaster недоступен, используется обычная транзакция');
        txHash = await walletClient.sendTransaction({
          account: address,
          to: CONTRACTS.gameStarter,
          data,
          value: 0n,
          chain: base,
        });
      }

      setHash(txHash);
      setIsPending(false);
      return txHash;
    } catch (err) {
      console.error('❌ [useGameStart] Failed:', err);
      const error = err as Error;
      setError(error);
      setIsPending(false);
      throw error;
    }
  };

  return {
    startGame,
    hash,
    isPending,
    isConfirming,
    isConfirmed,
    error: error || confirmError,
  };
}
