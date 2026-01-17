'use client';

import { useState } from 'react';
import { useNetwork } from '@/lib/context/NetworkContext';
import { getKeypairForSigning, isRecentlyAuthenticated, updateLastAuth } from '@/lib/sui/signing';
import { getCachedWalletInfo } from '@/lib/sui/passkey';
import { buildWithdrawTransaction } from '@/lib/scallop/client';
import AuthStatusIndicator from './AuthStatusIndicator';

interface ScallopWithdrawProps {
  onSuccess?: () => void;
}

interface WithdrawResult {
  txBytes: string;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
  };
}

export default function ScallopWithdraw({ onSuccess }: ScallopWithdrawProps) {
  const { client, network } = useNetwork();
  const [coinName, setCoinName] = useState('sui');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txDigest, setTxDigest] = useState('');
  const [marketInfo, setMarketInfo] = useState<WithdrawResult['marketInfo'] | null>(null);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTxDigest('');
    setMarketInfo(null);

    // Validation
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (amountNum < 0.1) {
      setError('Minimum withdraw is 0.1 SUI. Please enter a larger amount.');
      return;
    }

    setLoading(true);

    try {
      const walletInfo = getCachedWalletInfo();
      if (!walletInfo) {
        setError('Wallet not found. Please login again.');
        setLoading(false);
        return;
      }

      const amountInMist = Math.floor(parseFloat(amount) * 1_000_000_000);
      
      console.log('Building withdraw transaction:', {
        userAddress: walletInfo.address,
        coinName,
        amount: amountInMist,
        originalAmount: amount,
      });

      // Step 1: Build transaction on frontend with wallet context
      const { transaction, marketInfo: info } = await buildWithdrawTransaction(
        walletInfo.address,
        coinName,
        amountInMist,
      );

      setMarketInfo(info);

      // Step 2: Get keypair for signing
      const wallet = await getKeypairForSigning();
      if (!wallet) {
        setError('Failed to access wallet. Please try again.');
        setLoading(false);
        return;
      }

      // Step 3: Sign and execute
      const recentAuth = isRecentlyAuthenticated(30000);
      if (recentAuth) {
        console.log('✅ Using cached authentication - no passkey prompt needed');
      }

      const result = await client.signAndExecuteTransaction({
        signer: wallet,
        transaction,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Update last auth time for future transactions
      updateLastAuth();

      if (result.effects?.status?.status === 'success') {
        setSuccess('Withdraw successful!');
        setTxDigest(result.digest);
        setAmount('');
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Withdraw error:', err);
      setError(err instanceof Error ? err.message : 'Failed to withdraw tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">💸</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Scallop Withdraw
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Withdraw your supplied assets
          </p>
        </div>
      </div>

      {/* Network Warning */}
      {network !== 'mainnet' && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start">
            <span className="text-xl mr-2">⚠️</span>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">Mainnet Required</p>
              <p>Scallop Protocol is only available on <strong>Mainnet</strong>. Please switch network above to use this feature.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleWithdraw} className="space-y-4">
        {/* Coin Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Coin
          </label>
          <select
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="sui">SUI</option>
            <option value="usdc">USDC</option>
            <option value="usdt">USDT</option>
            <option value="weth">WETH</option>
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ({coinName.toUpperCase()})
          </label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum: 0.1 {coinName.toUpperCase()} • Enter amount to withdraw
          </p>
        </div>

        {/* Market Info Display */}
        {marketInfo && (
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-3">
              📊 Market Information
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xs text-orange-700 dark:text-orange-300">Supply APY</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {marketInfo.supplyApy.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-orange-700 dark:text-orange-300">Borrow APY</p>
                <p className="text-lg font-bold text-orange-900 dark:text-orange-100">
                  {marketInfo.borrowApy.toFixed(2)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
              {success}
            </p>
            {txDigest && (
              <a
                href={`https://suiscan.xyz/mainnet/tx/${txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 dark:text-green-400 hover:underline break-all"
              >
                View on Explorer: {txDigest.slice(0, 20)}...
              </a>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || network !== 'mainnet'}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <span className="mr-2">💸</span>
              Withdraw from Scallop
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start">
          <span className="text-lg mr-2">💡</span>
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Backend builds withdraw transaction</li>
              <li>You sign with Passkey (Touch ID/Face ID)</li>
              <li>Transaction executes on Sui blockchain</li>
              <li>Your SUI is returned to your wallet!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
