import { useState } from 'react';
import { showToast } from '@/shared/components/feedback';
import type { LendingPool } from '@/features/lending/types/lending.types';

export interface UseLendingTransactionParams {
  pool: LendingPool;
  walletAddress: string;
  onSuccess: () => void;
  onClose: () => void;
}

export interface UseLendingTransactionReturn {
  loading: boolean;
  executeTransaction: (
    amount: number,
    buildTransaction: (params: {
      userAddress: string;
      coinName: string;
      amount: number;
    }) => Promise<{ transaction: any }>,
    successMessage: string
  ) => Promise<void>;
}

export function useLendingTransaction({
  pool,
  walletAddress,
  onSuccess,
  onClose,
}: UseLendingTransactionParams): UseLendingTransactionReturn {
  const [loading, setLoading] = useState(false);

  const executeTransaction = async (
    amount: number,
    buildTransaction: (params: {
      userAddress: string;
      coinName: string;
      amount: number;
    }) => Promise<{ transaction: any }>,
    successMessage: string
  ) => {
    setLoading(true);

    try {
      // Dynamic imports to reduce bundle size
      const { recoverPasskeyWallet } = await import('@/integrations/sui/passkey');
      const { signAndExecuteSwapTransaction } = await import('@/integrations/suilend/core/signing');

      // Recover wallet
      const wallet = await recoverPasskeyWallet();
      if (!wallet) {
        throw new Error('Failed to recover wallet. Please login again.');
      }

      // Build transaction
      console.log('Building transaction...');
      const result = await buildTransaction({
        userAddress: walletAddress,
        coinName: pool.coin.toLowerCase(),
        amount,
      });

      // Sign and execute
      console.log('Signing and executing transaction...');
      const txResult = await signAndExecuteSwapTransaction(
        result.transaction,
        wallet.keypair
      );

      console.log('Transaction executed successfully:', txResult.digest);

      // Show success toast
      showToast({
        type: 'success',
        title: 'Transaction Successful!',
        message: successMessage,
        txDigest: txResult.digest,
        duration: 6000,
      });

      // Trigger callbacks
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Transaction failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Transaction failed';

      showToast({
        type: 'error',
        title: 'Transaction Failed',
        message: errorMsg,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    executeTransaction,
  };
}
