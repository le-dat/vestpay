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
      <div className="bg-white dark:bg-gray-800/50 rounded-[20px] p-4 shadow-lg border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-bold">Finding best routes...</span>
        </div>
      </div>
    );
  }

  if (validQuotes.length === 0) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="quote-list"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-white dark:bg-gray-800/50 rounded-[20px] p-2.5 space-y-1.5 shadow-lg border border-gray-100 dark:border-gray-700/50 overflow-hidden"
      >
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
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.08, ease: "easeOut" }}
                onClick={() => onSelectQuote(quote)}
                disabled={loading}
                whileHover={{ scale: 1.01, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center justify-between p-3 rounded-[16px] transition-all ${
                  isSelected
                    ? "bg-[#00d084]/10 border-2 border-[#00d084]/30 shadow-md"
                    : "bg-gray-50 dark:bg-gray-700/30 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  {DEX_ICONS?.[dexName] ? (
                    <Image
                      src={DEX_ICONS?.[dexName]}
                      alt={dexName}
                      className="w-10 h-10 rounded-xl"
                      width={40}
                      height={40}
                    />
                  ) : (
                    <motion.div
                      className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d084] to-[#00a569] flex items-center justify-center text-xl shadow-md"
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      {dexName.slice(0, 2).toUpperCase()}
                    </motion.div>
                  )}
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-[14px] text-gray-800 dark:text-white uppercase tracking-tight">
                        {quote.provider}
                      </span>
                      {isBest && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 30 }}
                          className="px-2.5 py-1 bg-gradient-to-r from-[#00d084] to-[#00a569] text-white text-[10px] font-black rounded-full uppercase shadow-sm"
                        >
                          Best
                        </motion.span>
                      )}
                    </div>
                    <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                      {quote.routes?.length || 0} route{(quote.routes?.length || 0) > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <motion.div
                  className="text-right"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="font-black text-[15px] text-gray-900 dark:text-white">
                    {amountOut.toFixed(4)} {tokenOut.symbol}
                  </div>
                  <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    ≈ ${amountOut.toFixed(2)}
                  </div>
                </motion.div>
              </motion.button>
            );
          } catch (error) {
            console.error("Error rendering quote:", error);
            return null;
          }
        })}
      </motion.div>
    </AnimatePresence>
  );
}
