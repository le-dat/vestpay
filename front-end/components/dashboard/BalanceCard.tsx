"use client";

import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";
import { useWallet } from "@/lib/hooks/useWallet";
import { useState } from "react";

interface BalanceCardProps {
  onDeposit?: () => void;
  onSend?: () => void;
}

export default function BalanceCard({ onDeposit, onSend }: BalanceCardProps) {
  const { coins, loading, refresh } = useWallet();
  const [refreshing, setRefreshing] = useState(false);

  // Get primary SUI balance
  const suiCoin = coins.find((coin) => coin.coinType.includes("::sui::SUI"));
  const suiBalance = suiCoin?.balanceFormatted || "0";

  // Get USDT or first non-SUI token for asset display
  const assetCoin = coins.find(
    (coin) =>
      coin.symbol === "USDT" || !coin.coinType.includes("::sui::SUI")
  ) || suiCoin;

  const handleRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Calculate total USD value (placeholder - requires price API)
  const totalUSD = "0.00";

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
      {/* Header with Refresh */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[40px] font-bold text-primary mb-1">
          ${totalUSD}{" "}
          <span className="text-gray-400 text-2xl font-medium ml-1">USD</span>
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="p-2 hover:bg-gray-50 rounded-full transition-all disabled:opacity-50"
          title="Refresh balance"
        >
          <RefreshCw
            className={`w-5 h-5 text-gray-400 ${refreshing || loading ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* Asset & Balance */}
      <div className="grid grid-cols-2 gap-8 mb-10">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Asset
          </p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <div className="flex items-center gap-3">
              {assetCoin?.iconUrl ? (
                <img
                  src={assetCoin.iconUrl}
                  alt={assetCoin.symbol}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#26A17B] flex items-center justify-center text-white text-xs font-bold">
                  {assetCoin?.symbol?.charAt(0) || "S"}
                </div>
              )}
              <span className="font-bold text-gray-900">
                {assetCoin?.symbol || "SUI"}
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Balance
          </p>
          {loading ? (
            <div className="h-6 w-32 bg-gray-100 rounded animate-pulse ml-auto"></div>
          ) : (
            <p className="font-bold text-gray-900">
              {parseFloat(assetCoin?.balanceFormatted || "0").toFixed(4)}{" "}
              {assetCoin?.symbol || "SUI"}
            </p>
          )}
        </div>
      </div>

      {/* All Coins Summary */}
      {!loading && coins.length > 1 && (
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
          <p className="text-xs font-semibold text-gray-500 mb-2">All Assets</p>
          <div className="space-y-2">
            {coins.map((coin) => (
              <div
                key={coin.coinType}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  {coin.iconUrl ? (
                    <img
                      src={coin.iconUrl}
                      alt={coin.symbol}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
                      {coin.symbol.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium text-gray-700">
                    {coin.symbol}
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {parseFloat(coin.balanceFormatted).toFixed(4)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onDeposit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-100 font-semibold text-primary hover:bg-gray-50 transition-all"
        >
          <ArrowDownLeft className="w-5 h-5" />
          Deposit
        </button>
        <button
          onClick={onSend}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-gray-100 font-semibold text-primary hover:bg-gray-50 transition-all"
        >
          <ArrowUpRight className="w-5 h-5" />
          Send
        </button>
      </div>
    </div>
  );
}
