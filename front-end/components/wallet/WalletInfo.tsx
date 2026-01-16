'use client';

import { useState, useEffect } from 'react';
import { getExplorerUrl } from '@/lib/sui/client';
import { getCachedWalletInfo } from '@/lib/sui/passkey';
import { useNetwork } from '@/lib/context/NetworkContext';

interface WalletInfoProps {
  refreshTrigger?: number;
}

export default function WalletInfo({ refreshTrigger }: WalletInfoProps) {
  const { client, network } = useNetwork();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const info = getCachedWalletInfo();
    setWalletInfo(info);
  }, []);

  useEffect(() => {
    if (mounted && walletInfo?.address) {
      loadBalance();
    }
  }, [mounted, walletInfo?.address, network, refreshTrigger]); // Added refreshTrigger

  const loadBalance = async () => {
    if (!walletInfo?.address) return;

    setLoading(true);
    try {
      const balance = await client.getBalance({
        owner: walletInfo.address,
      });
      // Convert MIST to SUI with decimals (1 SUI = 1_000_000_000 MIST)
      const suiBalance = (Number(balance.totalBalance) / 1_000_000_000).toFixed(9);
      // Remove trailing zeros but keep at least 2 decimal places
      const formatted = parseFloat(suiBalance).toString();
      setBalance(formatted);
    } catch (error) {
      console.error('Failed to load balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted || !walletInfo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Sui Wallet
        </h2>
        <button
          onClick={loadBalance}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh balance"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Balance */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 mb-6">
        <p className="text-blue-100 text-sm mb-2">Balance</p>
        <div className="flex items-baseline">
          {loading ? (
            <div className="h-10 w-32 bg-white/20 rounded animate-pulse"></div>
          ) : (
            <>
              <span className="text-4xl font-bold text-white">{balance}</span>
              <span className="text-xl text-blue-100 ml-2">SUI</span>
            </>
          )}
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-sm text-gray-900 dark:text-white break-all">
              {walletInfo.address}
            </div>
            <button
              onClick={copyAddress}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              title="Copy address"
            >
              {copied ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Public Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Public Key
          </label>
          <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg font-mono text-xs text-gray-600 dark:text-gray-400 break-all">
            {walletInfo.publicKey}
          </div>
        </div>

        {/* Explorer Link */}
        <a
          href={getExplorerUrl(walletInfo.address, network)}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          View on Sui Explorer →
        </a>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          🔒 <strong>Secure:</strong> Your private key is stored in your device's Passkey and never exposed to the internet.
        </p>
      </div>
    </div>
  );
}
