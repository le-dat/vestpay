"use client";

import { CoinIcon } from "@/components/wallet/CoinIcon";
import { useRefresh } from "@/lib/hooks/useRefresh";
import { useWallet } from "@/lib/hooks/useWallet";
import { ScallopMarketData } from "@/lib/types/defi";
import { formatCoinBalance, formatCurrency } from "@/lib/utils/format";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, LayoutGrid, RefreshCw, Wallet } from "lucide-react";
import { useMemo } from "react";

interface BalanceCardProps {
  onDeposit?: () => void;
  onSend?: () => void;
  marketData?: ScallopMarketData;
}

export default function BalanceCard({ onDeposit, onSend, marketData }: BalanceCardProps) {
  const { coins, loading, refresh } = useWallet();
  const { refreshing, handleRefresh } = useRefresh(refresh);

  const { totalUSD, coinValues } = useMemo(() => {
    if (!marketData?.pools || coins.length === 0) {
      return { totalUSD: "0.00", coinValues: {} };
    }

    let total = 0;
    const values: Record<string, number> = {};

    coins.forEach((coin) => {
      // Find matching pool to get price
      // Try to match by symbol
      const pool = marketData.pools.find(
        (p) => p.symbol.toUpperCase() === coin.symbol.toUpperCase()
      );

      // Default price to 0 if not found
      // For SUI, we might want to ensure we always have a price if possible, 
      // but Scallop market data should have it.
      const price = pool?.coinPrice || 0;
      const balance = parseFloat(coin.balanceFormatted);
      const value = balance * price;

      values[coin.symbol] = value;
      total += value;
    });

    return {
      totalUSD: formatCurrency(total).replace('$', ''), // Remove $ since we add it in UI
      coinValues: values
    };
  }, [coins, marketData]);

  return (
    <div className="relative overflow-hidden bg-white border border-gray-100 rounded-[32px] shadow-xs hover:shadow-xl transition-all duration-500 group">
      {/* Decorative Background Gradient */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-bl from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="p-8 sm:p-10 relative z-10">
        <div className="flex items-start justify-between mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400 font-semibold text-xs uppercase tracking-widest mb-2">
              <Wallet className="w-3.5 h-3.5" />
              <span>Total Balance</span>
            </div>
            <h2 className="text-[56px] leading-none font-bold text-secondary tracking-tight">
              ${totalUSD} <span className="text-gray-300 text-3xl font-medium ml-1">USD</span>
            </h2>
          </div>

          <motion.button
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="p-3 bg-gray-50 hover:bg-white hover:shadow-md border border-gray-100 rounded-2xl transition-all disabled:opacity-50 group/refresh"
            title="Refresh balance"
          >
            <RefreshCw
              className={`w-6 h-6 text-gray-400 group-hover/refresh:text-primary transition-colors ${refreshing || loading ? "animate-spin text-primary" : ""
                }`}
            />
          </motion.button>
        </div>

        {!loading && coins.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <LayoutGrid className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-secondary">Asset Distribution</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coins.map((coin, index) => {
                const usdValue = coinValues[coin.symbol] || 0;

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={coin.coinType}
                    className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-white border border-transparent hover:border-primary/20 rounded-2xl transition-all group/coin"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <CoinIcon
                          iconUrl={coin.iconUrl}
                          symbol={coin.symbol}
                          size="md"
                          variant="primary"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                          {coin.symbol}
                        </p>
                        <p className="text-sm font-bold text-secondary">
                          {coin.symbol === "SUI" ? "Sui Network" : coin.symbol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary leading-none mb-1">
                        {formatCoinBalance(coin.balanceFormatted)}
                      </p>
                      <p className="text-[10px] font-medium text-gray-400 tracking-tight">
                        ≈ {formatCurrency(usdValue)}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-2">
          <button
            onClick={onDeposit}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-secondary font-bold hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <ArrowDownLeft className="w-5 h-5" />
            Deposit
          </button>
          <button
            onClick={onSend}
            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-secondary text-white font-bold hover:shadow-lg hover:shadow-secondary/25 hover:-translate-y-0.5 transition-all active:scale-95"
          >
            <ArrowUpRight className="w-5 h-5" />
            Send Assets
          </button>
        </div>
      </div>
    </div>
  );
}
