'use client';

import { useState } from 'react';
import { requestFaucet } from '@/lib/sui/utils';
import { getCachedWalletInfo } from '@/lib/sui/passkey';
import { useNetwork } from '@/lib/context/NetworkContext';

interface FaucetButtonProps {
  onSuccess?: () => void;
}

export default function FaucetButton({ onSuccess }: FaucetButtonProps) {
  const { network } = useNetwork();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const walletInfo = getCachedWalletInfo();

  const handleRequest = async () => {
    if (!walletInfo?.address) {
      setMessage('No wallet found');
      setIsError(true);
      return;
    }

    if (network !== 'testnet') {
      setMessage('Faucet only available on Testnet');
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage('');
    setIsError(false);

    try {
      const result = await requestFaucet(walletInfo.address);
      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        onSuccess?.();
        // Clear message after 5 seconds
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error: any) {
      setMessage(error.message || 'Failed to request faucet');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (network !== 'testnet') {
    return (
      <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Faucet only available on Testnet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Requesting...
          </span>
        ) : (
          '💧 Get Free SUI from Faucet'
        )}
      </button>

      {message && (
        <div className={`rounded-lg p-3 ${isError
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
          }`}>
          <p className={`text-sm ${isError
              ? 'text-red-600 dark:text-red-400'
              : 'text-green-600 dark:text-green-400'
            }`}>
            {message}
          </p>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>Receive 1 SUI on Testnet (may take a few seconds)</p>
        <p>
          Alternative: Get SUI from{' '}
          <a
            href="https://discord.gg/sui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Sui Discord
          </a>
          {' '}#testnet-faucet channel
        </p>
      </div>
    </div>
  );
}
