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
      console.log('🎮 [useGameStart] Calling writeContract...');
      await writeContract({
        address: CONTRACTS.gameStarter,
        abi: GameStarterABI,
        functionName: 'startGame',
        args: [],
      });
      console.log('🎮 [useGameStart] writeContract returned, hash:', hash);
    } catch (error) {
      console.error('❌ [useGameStart] Failed to write contract:', error);
      throw error;
    }
  };

  // Логирование для отладки
  console.log('🎮 [useGameStart] State:', {
    hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
  });

  return {
    startGame,
    hash,
    isPending: isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError || confirmError,
  };
}
