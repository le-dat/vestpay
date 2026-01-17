'use client';

import { useState, useEffect } from 'react';
import { getCachedWalletInfo } from '@/lib/sui/passkey';
import { getScallopPosition } from '@/lib/scallop/client';

interface LendingPosition {
  supplied: Array<{
    coinType: string;
    amount: string;
    apy: number;
  }>;
  borrowed: Array<{
    coinType: string;
    amount: string;
    apy: number;
  }>;
  collateral: Array<{
    coinType: string;
    amount: string;
  }>;
  totalSuppliedValue: string;
  totalBorrowedValue: string;
  healthFactor: number;
}

export default function ScallopPosition() {
  const [position, setPosition] = useState<LendingPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPosition = async () => {
    setLoading(true);
    setError('');

    try {
      const walletInfo = getCachedWalletInfo();
      if (!walletInfo) {
        setError('Wallet not found');
        return;
      }
      console.log('walletInfo', walletInfo.address);
      const position = await getScallopPosition(walletInfo.address);
      console.log('position', position);
      setPosition(position);
    } catch (err) {
      console.error('Fetch position error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch position');
    } finally {
      setLoading(false);
    }
  };

  const handleSetObligation = () => {
    const walletInfo = getCachedWalletInfo();
    if (!walletInfo) return;

    // Known obligation for this user (from transaction)
    const OBLIGATION_ID = '0x5ec78008dfeb1becc189d4cebf2be463cf2898547756bf08dfad14e7e3f4e330';
    const OBLIGATION_KEY = '0x02b8e095d61a830eac1c410c6f7a47dafb1350e829d3a93d107c51a2cda54a93';

    localStorage.setItem(`scallop_obligation_${walletInfo.address}`, OBLIGATION_ID);
    localStorage.setItem(`scallop_obligation_key_${walletInfo.address}`, OBLIGATION_KEY);

    console.log('✅ Obligation ID set:', OBLIGATION_ID);

    // Refresh position
    fetchPosition();
  };

  useEffect(() => {
    fetchPosition();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
            <span className="text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Scallop Position
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your lending & borrowing
            </p>
          </div>
        </div>
        <button
          onClick={fetchPosition}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
        >
          {loading ? '...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {loading && !position && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Loading position...</p>
        </div>
      )}

      {!loading && position && position.supplied.length === 0 && position.borrowed.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <span className="text-4xl mb-3 block">📊</span>
            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
              No Position Found
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Can't find your position? This might be due to Scallop SDK indexer delay.
            </p>
            <button
              onClick={handleSetObligation}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              🔧 Fix: Load My Position
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              This will manually set your obligation ID from the transaction
            </p>
          </div>
        </div>
      )}

      {position && (position.supplied.length > 0 || position.borrowed.length > 0) && (
        <div className="space-y-4">
          {/* Supplied Assets */}
          {position.supplied.length > 0 ? (
            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
                💰 Supplied Assets
              </h4>
              {position.supplied.map((asset, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {asset.coinType.includes('SUI') ? 'SUI' : asset.coinType.split('::').pop()}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      APY: {asset.apy.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-900 dark:text-green-100">
                    {(parseFloat(asset.amount) / 1_000_000_000).toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {/* Borrowed Assets */}
          {position.borrowed.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
              <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-100 mb-3">
                📤 Borrowed Assets
              </h4>
              {position.borrowed.map((asset, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                      {asset.coinType.includes('SUI') ? 'SUI' : asset.coinType.split('::').pop()}
                    </p>
                    <p className="text-xs text-orange-700 dark:text-orange-300">
                      APY: {asset.apy.toFixed(2)}%
                    </p>
                  </div>
                  <p className="text-sm font-bold text-orange-900 dark:text-orange-100">
                    {(parseFloat(asset.amount) / 1_000_000_000).toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Collateral */}
          {position.collateral.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                🔒 Collateral
              </h4>
              {position.collateral.map((asset, idx) => (
                <div key={idx} className="flex justify-between items-center py-2">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {asset.coinType.includes('SUI') ? 'SUI' : asset.coinType.split('::').pop()}
                  </p>
                  <p className="text-sm font-bold text-blue-900 dark:text-blue-100">
                    {(parseFloat(asset.amount) / 1_000_000_000).toFixed(4)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-purple-700 dark:text-purple-300">Total Supplied</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  ${position.totalSuppliedValue}
                </p>
              </div>
              <div>
                <p className="text-xs text-purple-700 dark:text-purple-300">Total Borrowed</p>
                <p className="text-lg font-bold text-purple-900 dark:text-purple-100">
                  ${position.totalBorrowedValue}
                </p>
              </div>
            </div>
            {position.healthFactor > 0 && (
              <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700">
                <p className="text-xs text-purple-700 dark:text-purple-300">Health Factor</p>
                <p className={`text-lg font-bold ${position.healthFactor > 1.5
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-orange-600 dark:text-orange-400'
                  }`}>
                  {position.healthFactor.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
