"use client";

import { useRefresh } from "@/shared/hooks";
import { useWallet } from "@/features/wallet";
import { ScallopMarketData } from "@/features/lending";
import { formatCurrency } from "@/shared/utils";
import { motion } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Wallet } from "lucide-react";
import { useMemo } from "react";

interface BalanceCardProps {
  onDeposit?: () => void;
  onSend?: () => void;
  marketData?: ScallopMarketData;
}

export default function BalanceCard({ onDeposit, onSend, marketData }: BalanceCardProps) {
  const { coins, loading, refresh } = useWallet();
  const { refreshing, handleRefresh } = useRefresh(refresh);

  const totalUSD = useMemo(() => {
    if (!marketData?.pools || coins.length === 0) {
      return "0.00";
    }

    let total = 0;

    coins.forEach((coin) => {
      const pool = marketData.pools.find(
        (p) =>
          p.coinType === coin.coinType ||
          p.sCoinType === coin.coinType ||
          p.symbol.toUpperCase() === coin.symbol.toUpperCase(),
      );

      let price = pool?.coinPrice || 0;

      if (pool && pool.sCoinType === coin.coinType) {
        price = price * (pool.conversionRate || 1);
      }

      const balance = parseFloat(coin.balanceFormatted);
      const value = balance * price;

      total += value;
    });

    return formatCurrency(total).replace("$", "");
  }, [coins, marketData]);

  return (
    <div className="relative overflow-hidden bg-white border border-gray-200 transition-all duration-500 group">
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
              className={`w-6 h-6 text-gray-400 group-hover/refresh:text-primary transition-colors ${
                refreshing || loading ? "animate-spin text-primary" : ""
              }`}
            />
          </motion.button>
        </div>

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
