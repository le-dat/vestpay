'use client';

import { useState, useEffect } from 'react';
import { useNetwork } from '@/shared/contexts';
import { getTransactionHistory } from '@/integrations/sui/utils';
import { getCachedWalletInfo } from '@/integrations/sui/passkey';

interface TransactionHistoryProps {
  refreshTrigger?: number;
}

export default function TransactionHistory({ refreshTrigger }: TransactionHistoryProps) {
  const { client, network } = useNetwork();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const walletInfo = getCachedWalletInfo();

  useEffect(() => {
    loadTransactions();
  }, [network, walletInfo?.address, refreshTrigger]);

  const loadTransactions = async () => {
    if (!walletInfo?.address) return;

    setLoading(true);
    try {
      const txs = await getTransactionHistory(client, walletInfo.address);
      setTransactions(txs);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const getExplorerUrl = (digest: string) => {
    const baseUrl = network === 'mainnet'
      ? 'https://suiscan.xyz/mainnet'
      : `https://suiscan.xyz/${network}`;
    return `${baseUrl}/tx/${digest}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Transaction History
        </h3>
        <button
          onClick={loadTransactions}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((tx) => (
            <div
              key={tx.digest}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${tx.status === 'success'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                    {tx.status === 'success' ? '✓ Success' : '✗ Failed'}
                  </span>
                </div>
                <a
                  href={getExplorerUrl(tx.digest)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  View →
                </a>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Digest:</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {tx.digest.slice(0, 8)}...{tx.digest.slice(-6)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Time:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDate(tx.timestamp)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Gas:</span>
                  <span className="text-gray-900 dark:text-white">
                    {(BigInt(tx.gasUsed) / BigInt(1_000_000_000)).toString()} SUI
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
