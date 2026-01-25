"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FormattedCoinBalance } from "@/integrations/sui/balance";

interface AssetRowProps {
  asset: FormattedCoinBalance & {
    usdValue: number;
    usdChange: number;
    chain: string;
  };
}

export default function AssetRow({ asset }: AssetRowProps) {
  const balance = parseFloat(asset.balanceFormatted);
  const formattedBalance = balance.toFixed(2);
  const formattedUsdValue = `$${asset.usdValue.toLocaleString("en-US")}`;
  const isPositiveChange = asset.usdChange >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative hover:bg-gray-50/50 rounded-lg p-4 transition-all duration-200 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Asset Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
            {asset.iconUrl ? (
              <Image
                src={asset.iconUrl}
                alt={asset.symbol}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-semibold text-sm">
                {asset.symbol.charAt(0)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">{asset.name}</h4>
            <p className="text-xs text-gray-500 uppercase">{asset.symbol}</p>
          </div>
        </div>

        {/* Balance */}
        <div className="text-right min-w-[120px]">
          <p className="text-sm font-semibold text-gray-900">{formattedBalance}</p>
          <p className="text-xs text-gray-400">≈ ${balance === 0 ? "0.00" : "0.00"}</p>
        </div>

        {/* USD Value */}
        <div className="text-right min-w-[120px]">
          <p className="text-sm font-semibold text-gray-900">{formattedUsdValue}</p>
          <div className="flex items-center justify-end gap-1">
            <span className={`text-xs ${isPositiveChange ? "text-green-500" : "text-red-500"}`}>
              {isPositiveChange ? "↗" : "↘"} {Math.abs(asset.usdChange).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Chain Badge */}
        <div className="min-w-[80px] text-right">
          <span className="inline-block px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md border border-blue-200">
            {asset.chain}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
