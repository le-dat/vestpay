"use client";

import { useState, useEffect } from "react";
import { useNetwork } from "@/shared/contexts";
import { getAllBalances } from "@/integrations/sui/utils";
import { getCachedWalletInfo } from "@/integrations/sui/passkey";

interface TokenListProps {
  refreshTrigger?: number;
}

interface TokenBalance {
  coinType: string;
  balance: string;
  symbol: string;
}

export default function TokenList({ refreshTrigger }: TokenListProps) {
  const { client } = useNetwork();
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const walletInfo = getCachedWalletInfo();

  useEffect(() => {
    loadTokens();
  }, [walletInfo?.address, refreshTrigger]);

  const loadTokens = async () => {
    if (!walletInfo?.address) return;

    setLoading(true);
    try {
      const balances = await getAllBalances(client, walletInfo.address);
      setTokens(balances);
    } catch (error) {
      console.error("Failed to load tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Token Balances</h3>
        <button
          onClick={loadTokens}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title="Refresh"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      ) : tokens.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No tokens found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tokens.map((token, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {token.symbol.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{token.symbol}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {token.coinType.slice(0, 20)}...
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-white">{token.balance}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{token.symbol}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
