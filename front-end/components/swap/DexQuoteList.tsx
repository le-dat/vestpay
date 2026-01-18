"use client";

import { extractRawAmountOut } from "@/lib/suilend/core/quote";
import type { CetusToken } from "@/lib/suilend/core/tokens";
import type { StandardizedQuote } from "@suilend/sdk";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";

interface DexQuoteListProps {
  quotes: StandardizedQuote[];
  tokenOut: CetusToken | null;
  selectedQuote: StandardizedQuote | null;
  onSelectQuote: (quote: StandardizedQuote) => void;
  loading: boolean;
}

const DEX_ICONS: Record<string, string> = {
  aftermath: "/images/swap/aftermath.png",
  cetus: "/images/swap/cetus.webp",
  flowx: "/images/swap/flowx.png",
};

export default function DexQuoteList({
  quotes,
  tokenOut,
  selectedQuote,
  onSelectQuote,
  loading,
}: DexQuoteListProps) {
  const validQuotes = quotes.filter((quote) => {
    try {
      return quote && quote.routes && quote.routes.length > 0;
    } catch {
      return false;
    }
  });

  if (loading) {
    return (
      <div className="bg-white/50 dark:bg-white/5 backdrop-blur-md rounded-[24px] p-6 border border-gray-100 dark:border-white/10 flex flex-col items-center justify-center gap-4 min-h-[200px]">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-[#00d084]/20 border-t-[#00d084] rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 bg-[#00d084]/10 rounded-full animate-pulse" />
          </div>
        </div>
        <span className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-widest animate-pulse">
          Searching Routes...
        </span>
      </div>
    );
  }

  if (validQuotes.length === 0) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="quote-list"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-white dark:bg-white/5 rounded-[28px] p-3 space-y-2 border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden"
      >
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="text-[11px] font-black text-[#94a3b8] uppercase tracking-[0.2em]">
            Available Routes
          </span>
          <span className="text-[10px] font-black text-[#00d084] bg-[#00d084]/10 px-2 py-0.5 rounded-full uppercase">
            Best Price Selected
          </span>
        </div>

        <div className="space-y-1.5">
          {validQuotes.map((quote, index) => {
            if (!tokenOut) return null;

            try {
              const rawAmount = extractRawAmountOut(quote);
              const amountOut = rawAmount / Math.pow(10, tokenOut.decimals);
              const isSelected = selectedQuote?.id === quote.id;
              const isBest = index === 0;
              const dexName = quote.provider.toLowerCase();

              return (
                <motion.button
                  key={quote.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectQuote(quote)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-[20px] transition-all duration-300 relative group overflow-hidden ${
                    isSelected
                      ? "bg-[#00d084]/5 border-2 border-[#00d084]/20"
                      : "bg-gray-50/50 dark:bg-white/[0.02] border-2 border-transparent hover:border-gray-200 dark:hover:border-white/10"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 bg-gradient-to-r from-[#00d084]/5 to-transparent pointer-events-none"
                    />
                  )}

                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      {DEX_ICONS?.[dexName] ? (
                        <div className="w-11 h-11 rounded-2xl overflow-hidden bg-white p-1 border border-gray-100 dark:border-white/10 shadow-sm">
                          <Image
                            src={DEX_ICONS?.[dexName]}
                            alt={dexName}
                            width={44}
                            height={44}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-[#111827] flex items-center justify-center text-white font-black text-lg border border-white/10">
                          {dexName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {isBest && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#00d084] rounded-full flex items-center justify-center border-2 border-white dark:border-[#111827] shadow-sm">
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[15px] text-[#111827] dark:text-white uppercase tracking-tight">
                          {quote.provider}
                        </span>
                        {isBest && (
                          <span className="text-[9px] font-black text-[#00d084] bg-[#00d084]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Optimized
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-bold text-[#94a3b8] mt-0.5">
                        {quote.routes?.length || 0} Routes • High Liquidity
                      </div>
                    </div>
                  </div>

                  <div className="text-right relative z-10">
                    <div className="font-black text-[17px] text-[#111827] dark:text-white leading-none">
                      {amountOut.toLocaleString(undefined, {
                        minimumFractionDigits: 4,
                        maximumFractionDigits: 6,
                      })}
                    </div>
                    <div className="text-[12px] font-black text-[#94a3b8] mt-1">
                      {tokenOut.symbol}
                    </div>
                  </div>
                </motion.button>
              );
            } catch (error) {
              return null;
            }
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
