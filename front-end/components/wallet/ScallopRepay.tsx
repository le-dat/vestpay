'use client';

import { useState } from 'react';
import { useNetwork } from '@/lib/context/NetworkContext';
import { getKeypairForSigning, isRecentlyAuthenticated, updateLastAuth } from '@/lib/sui/signing';
import { getCachedWalletInfo } from '@/lib/sui/passkey';
import { buildRepayTransaction } from '@/lib/scallop/client';
import AuthStatusIndicator from './AuthStatusIndicator';

interface ScallopRepayProps {
  onSuccess?: () => void;
}

export default function ScallopRepay({ onSuccess }: ScallopRepayProps) {
  const { client } = useNetwork();
  const [coinName, setCoinName] = useState('sui');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRepay = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get wallet info
      const walletInfo = getCachedWalletInfo();
      if (!walletInfo) {
        setError('Wallet not found. Please login again.');
        setLoading(false);
        return;
      }

      // Convert to MIST (smallest unit)
      const amountInMist = Math.floor(parseFloat(amount) * 1_000_000_000);

      console.log('Building repay transaction:', {
        userAddress: walletInfo.address,
        coinName,
        amount: amountInMist,
        originalAmount: amount,
      });

      // Step 1: Build transaction on frontend with wallet context
      const { transaction } = await buildRepayTransaction(
        walletInfo.address,
        coinName,
        amountInMist,
      );

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

      console.log('Repay result:', result);

      if (result.effects?.status?.status === 'success') {
        setSuccess(`Successfully repaid ${amount} ${coinName.toUpperCase()}!`);
        setAmount('');
        
        if (onSuccess) onSuccess();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Repay error:', err);
      setError(err instanceof Error ? err.message : 'Failed to repay tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Repay Borrowed Assets</h2>
        <AuthStatusIndicator />
      </div>

      <div className="space-y-4">
        {/* Coin Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Coin
          </label>
          <select
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            <option value="sui">SUI</option>
            <option value="usdc">USDC</option>
            <option value="usdt">USDT</option>
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Repay
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Repay Button */}
        <button
          onClick={handleRepay}
          disabled={loading || !amount}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Processing...' : 'Repay'}
        </button>

        {/* Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>💰 Repaying will reduce your borrowed amount</p>
          <p>📈 Your health factor will increase</p>
          <p>✅ You can withdraw more collateral after repaying</p>
        </div>
      </div>
    </div>
  );
}
