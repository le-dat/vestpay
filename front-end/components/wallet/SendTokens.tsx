'use client';

import { useState } from 'react';
import { useNetwork } from '@/lib/context/NetworkContext';
import { sendSui } from '@/lib/sui/transactions';
import { getKeypairForSigning } from '@/lib/sui/signing';

interface SendTokensProps {
  onSuccess?: () => void;
}

export default function SendTokens({ onSuccess }: SendTokensProps) {
  const { client, network } = useNetwork();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!recipient.startsWith('0x') || recipient.length !== 66) {
      setError('Invalid Sui address format');
      return;
    }

    setLoading(true);

    try {
      // Get keypair (checks cache first, recovers if needed)
      const wallet = await getKeypairForSigning();

      if (!wallet) {
        setError('Failed to access wallet. Please try again.');
        setLoading(false);
        return;
      }

      // Send transaction
      const result = await sendSui(client, wallet, recipient, amount);

      if (result.success) {
        setSuccess(`Transaction successful! Digest: ${result.digest?.slice(0, 10)}...`);
        setRecipient('');
        setAmount('');
        onSuccess?.();
      } else {
        setError(result.error || 'Transaction failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Send SUI
      </h3>

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount (SUI)
          </label>
          <input
            type="number"
            step="0.000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : 'Send Transaction'}
        </button>
      </form>

      {network !== 'mainnet' && (
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          💡 You're on {network}. Transactions are free!
        </p>
      )}
    </div>
  );
}
