"use client";

import { CoinIcon } from "@/components/wallet/CoinIcon";
import { useRefresh } from "@/lib/hooks/useRefresh";
import { useWallet } from "@/lib/hooks/useWallet";
import { formatCoinBalance } from "@/lib/utils/format";
import { ArrowDownLeft, ArrowUpRight, RefreshCw } from "lucide-react";

interface BalanceCardProps {
  onDeposit?: () => void;
  onSend?: () => void;
}

export default function BalanceCard({ onDeposit, onSend }: BalanceCardProps) {
  const { coins, loading, refresh } = useWallet();
  const { refreshing, handleRefresh } = useRefresh(refresh);

  const totalUSD = "0.00";

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-[40px] font-bold text-primary mb-1">
          ${totalUSD} <span className="text-gray-400 text-2xl font-medium ml-1">USD</span>
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

      {!loading && coins.length > 1 && (
        <div className="mb-8 p-4 bg-gray-50 rounded-2xl">
          <p className="text-xs font-semibold text-gray-500 mb-2">All Assets</p>
          <div className="space-y-2">
            {coins.map((coin) => (
              <div key={coin.coinType} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CoinIcon
                    iconUrl={coin.iconUrl}
                    symbol={coin.symbol}
                    size="sm"
                    variant="primary"
                  />
                  <span className="font-medium text-gray-700">{coin.symbol}</span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatCoinBalance(coin.balanceFormatted)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
