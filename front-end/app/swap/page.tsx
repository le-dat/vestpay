'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SwapInterface from '@/components/swap/SwapInterface';
import { getCachedWalletInfo } from '@/lib/sui/passkey';

export default function SwapPage() {
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Swap
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Trade tokens at the best rates
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            ← Back
          </button>
        </div>

        <SwapInterface walletInfo={walletInfo} />
      </div>
    </main>
  );
}
