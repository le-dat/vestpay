'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { ISwapTransactionResponse } from '@/lib/suilend';
import { showToast } from '@/components/common/Toast';

interface ExecuteSwapButtonProps {
  swapData: ISwapTransactionResponse;
  walletInfo: {
    address: string;
    email: string;
  };
  onSuccess: () => void;
  onBack: () => void;
}

export function ExecuteSwapButton({
  swapData,
  walletInfo,
  onSuccess,
  onBack,
}: ExecuteSwapButtonProps) {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [txDigest, setTxDigest] = useState('');

  async function handleExecuteSwap() {
    setExecuting(true);
    setError('');

    try {
      // Import signing function
      const { signAndExecuteSwapTransaction } = await import('@/lib/suilend/core/signing');
      const { recoverPasskeyWallet } = await import('@/lib/sui/passkey');

      // Recover passkey wallet
      const wallet = await recoverPasskeyWallet();
      if (!wallet) {
        throw new Error('Failed to recover wallet. Please login again.');
      }

      console.log('Executing swap transaction...');

      // Sign and execute transaction
      const result = await signAndExecuteSwapTransaction(
        swapData.transaction,
        wallet.keypair
      );

      console.log('Swap executed successfully:', result.digest);

      // Show success toast
      showToast({
        type: 'success',
        title: 'Swap Successful!',
        message: `Your swap has been executed successfully.`,
        txDigest: result.digest,
        duration: 6000,
      });

      // Call onSuccess immediately
      onSuccess();
    } catch (err) {
      console.error('Failed to execute swap:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to execute swap';
      setError(errorMsg);
      
      // Show error toast
      showToast({
        type: 'error',
        title: 'Swap Failed',
        message: errorMsg,
        duration: 6000,
      });
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="w-full space-y-3">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 text-red-700 p-4 rounded-xl text-sm font-bold"
        >
          {error}
        </motion.div>
      )}

      <div className="bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 p-4 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-600 dark:text-gray-400">Provider</span>
          <span className="font-black text-gray-900 dark:text-white uppercase">
            {swapData.quote.provider}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-600 dark:text-gray-400">You&apos;ll receive</span>
          <span className="font-black text-gray-900 dark:text-white">
            {swapData.quote.amountOutFormatted}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-600 dark:text-gray-400">Minimum received</span>
          <span className="font-black text-gray-900 dark:text-white">
            {swapData.slippage.minAmountOutFormatted}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold text-gray-600 dark:text-gray-400">Slippage tolerance</span>
          <span className="font-black text-gray-900 dark:text-white">
            {swapData.slippage.tolerance}%
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={executing}
          className="flex-1 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-black rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={handleExecuteSwap}
          disabled={executing}
          className="flex-1 py-4 bg-gradient-to-r from-[#00d084] to-[#00a569] hover:from-[#00c07a] hover:to-[#009557] text-white font-black text-lg rounded-2xl shadow-lg shadow-[#00d084]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {executing ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirming...
            </>
          ) : (
            'Confirm Swap'
          )}
        </button>
      </div>
    </div>
  );
}
