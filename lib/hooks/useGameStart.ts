// Hook для вызова GameStarter контракта
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { GameStarterABI } from '../contracts/GameStarterABI';
import { CONTRACTS } from '../contracts/contractAddresses';

export function useGameStart() {
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  /**
   * Вызвать startGame() контракта
   * Пользователь должен подписать транзакцию
   */
  const startGame = async () => {
    try {
      await writeContract({
        address: CONTRACTS.gameStarter,
        abi: GameStarterABI,
        functionName: 'startGame',
        args: [],
      });
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  };

  return {
    startGame,
    hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
  };
}
