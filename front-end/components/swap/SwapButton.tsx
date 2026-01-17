'use client';

import { useState } from 'react';
import { getCachedKeypairFromMemory } from '@/lib/sui/keypair-cache';
import type { ISwapTransactionResponse } from '@/lib/suilend';

interface SwapButtonProps {
  swapData: ISwapTransactionResponse;
  walletInfo: {
    address: string;
  };
  onSuccess: () => void;
  onBack: () => void;
}

export default function SwapButton({ swapData, walletInfo, onSuccess, onBack }: SwapButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSwap() {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let keypair = getCachedKeypairFromMemory();

      console.log('Keypair from cache:', keypair);

      // If no keypair in cache, try to re-authenticate with passkey
      if (!keypair) {
        console.log('No cached keypair, requesting passkey authentication...');

        try {
          const { recoverPasskeyWallet } = await import('@/lib/sui/passkey');
          const { cacheKeypairInMemory } = await import('@/lib/sui/keypair-cache');

          const wallet = await recoverPasskeyWallet();

          if (!wallet) {
            setError('Passkey authentication failed. Please login again.');
            setLoading(false);
            return;
          }

          // Cache for future use
          cacheKeypairInMemory(wallet.keypair);
          keypair = wallet.keypair;

          console.log('✅ Passkey re-authenticated successfully');
        } catch (authError) {
          setError('Failed to authenticate with passkey. Please login again.');
          setLoading(false);
          return;
        }
      }

      // Get current network from localStorage
      const network = typeof window !== 'undefined'
        ? localStorage.getItem('sui-network') || 'mainnet'
        : 'mainnet';

      const rpcUrls: Record<string, string> = {
        'mainnet': 'https://fullnode.mainnet.sui.io',
        'testnet': 'https://fullnode.testnet.sui.io',
        'devnet': 'https://fullnode.devnet.sui.io',
      };

      // Sign and execute transaction with passkey
      const { SuiClient } = await import('@mysten/sui/client');
      const client = new SuiClient({ url: rpcUrls[network] || rpcUrls.mainnet });

      console.log('Executing transaction on:', network);
      console.log('Transaction details:', {
        sender: walletInfo.address,
        provider: swapData.quote.provider,
        estimatedOut: swapData.quote.amountOutFormatted
      });

      // CRITICAL: Always rebuild transaction fresh using Cetus SDK directly
      if (!swapData.rebuildParams) {
        throw new Error('Missing swap parameters for rebuild');
      }

      console.log('Building fresh transaction using Cetus SDK');
      const { buildSwapTransactionFromQuote, createTokenObject } = await import('@/lib/suilend/core/transaction');

      const tokenInObj = createTokenObject(swapData.rebuildParams.tokenInType);
      const tokenOutObj = createTokenObject(swapData.rebuildParams.tokenOutType);

      const rebuilt = await buildSwapTransactionFromQuote(
        walletInfo.address,  // Use current wallet address
        tokenInObj,
        tokenOutObj,
        swapData.rebuildParams.amountIn,
        swapData.rebuildParams.slippagePercent,
        swapData.rebuildParams.rawQuote,
        undefined
      );

      console.log('Fresh Cetus transaction built, amountOut:', rebuilt.estimatedAmountOut);

      // Transaction is already configured by Cetus SDK
      const txToExecute = rebuilt.transaction;
      txToExecute.setGasBudget(10000000);

      console.log('Signing and executing transaction...');
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: txToExecute,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log('Transaction executed successfully:', {
        digest: result.digest,
        status: result.effects?.status?.status
      });

      setSuccess(`Swap successful! Tx: ${result.digest.slice(0, 10)}...`);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      console.error('Swap error:', err);
      setError(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={loading}
            className="flex-1 py-4 px-6 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 dark:from-gray-700 dark:to-gray-800 dark:hover:from-gray-600 dark:hover:to-gray-700 disabled:from-gray-200 disabled:to-gray-300 dark:disabled:from-gray-700 dark:disabled:to-gray-800 text-gray-900 dark:text-white font-bold rounded-xl transition-all disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <button
            onClick={handleSwap}
            disabled={loading}
            className="flex-1 py-4 px-6 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Executing Swap...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Confirm Swap
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-l-4 border-red-500 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">Transaction Failed</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">Success!</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">{success}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
