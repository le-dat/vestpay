'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import WalletInfo from '@/components/wallet/WalletInfo';
import SendTokens from '@/components/wallet/SendTokens';
import TransactionHistory from '@/components/wallet/TransactionHistory';
import TokenList from '@/components/wallet/TokenList';
import NetworkSwitcher from '@/components/wallet/NetworkSwitcher';
import FaucetButton from '@/components/wallet/FaucetButton';
import ScallopSupply from '@/components/wallet/ScallopSupply';
import ScallopWithdraw from '@/components/wallet/ScallopWithdraw';
import ScallopBorrow from '@/components/wallet/ScallopBorrow';
import ScallopRepay from '@/components/wallet/ScallopRepay';
import ScallopPosition from '@/components/wallet/ScallopPosition';
import { getCachedWalletInfo, clearWalletCache } from '@/lib/sui/passkey';

export default function DashboardPage() {
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const info = getCachedWalletInfo();
    if (!info) {
      router.push('/register');
    } else {
      setWalletInfo(info);
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    clearWalletCache();
    router.push('/');
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            {walletInfo && (
              <p className="text-gray-600 dark:text-gray-400">
                Welcome, <span className="font-medium">{walletInfo.email}</span>
              </p>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Logout
          </button>
        </div>

        {/* Network Switcher */}
        <div className="mb-6">
          <NetworkSwitcher />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Wallet Info */}
            <WalletInfo refreshTrigger={refreshKey} />

            {/* Faucet */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Get Testnet SUI
              </h3>
              <FaucetButton onSuccess={handleRefresh} />
            </div>

            {/* Token List */}
            <TokenList refreshTrigger={refreshKey} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Scallop Position */}
            <ScallopPosition />

            {/* Scallop Supply */}
            <ScallopSupply onSuccess={handleRefresh} />

            {/* Scallop Borrow */}
            <ScallopBorrow onSuccess={handleRefresh} />

            {/* Scallop Repay */}
            <ScallopRepay onSuccess={handleRefresh} />

            {/* Scallop Withdraw */}
            <ScallopWithdraw onSuccess={handleRefresh} />

            {/* Send Tokens */}
            <SendTokens onSuccess={handleRefresh} />

            {/* Transaction History */}
            <TransactionHistory refreshTrigger={refreshKey} />
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            💡 Quick Tips
          </h3>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use the <strong>Faucet</strong> to get free SUI on Testnet</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span><strong>Send SUI</strong> to any Sui address instantly</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>View all your <strong>token balances</strong> and <strong>transaction history</strong></span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Switch between <strong>Testnet, Devnet, and Mainnet</strong></span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your private key is secured by <strong>Passkey</strong> (Touch ID/Face ID/Windows Hello)</span>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
