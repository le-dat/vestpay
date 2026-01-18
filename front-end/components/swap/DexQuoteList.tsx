'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { StandardizedQuote } from '@suilend/sdk';
import { extractRawAmountOut } from '@/lib/suilend/core/quote';
import type { CetusToken } from '@/lib/suilend/core/tokens';

interface DexQuoteListProps {
  quotes: StandardizedQuote[];
  tokenOut: CetusToken | null;
  selectedQuote: StandardizedQuote | null;
  onSelectQuote: (quote: StandardizedQuote) => void;
  loading: boolean;
}

const DEX_ICONS: Record<string, string> = {
  aftermath: '🌊',
  cetus: '🐋',
  flowx: '💧',
  turbos: '⚡',
  bluefin: '🐟',
};

export default function DexQuoteList({
  quotes,
  tokenOut,
  selectedQuote,
  onSelectQuote,
  loading,
}: DexQuoteListProps) {
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
        {quotes.map((quote, index) => {
          if (!tokenOut) return null;
          
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
                  ? 'bg-[#00d084]/10 border-2 border-[#00d084]/30 shadow-md'
                  : 'bg-gray-50 dark:bg-gray-700/30 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div 
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d084] to-[#00a569] flex items-center justify-center text-xl shadow-md"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {DEX_ICONS[dexName] || '🔄'}
                </motion.div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-[14px] text-gray-800 dark:text-white uppercase tracking-tight">
                      {quote.provider}
                    </span>
                    {isBest && (
                      <motion.span 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: 'spring', stiffness: 500, damping: 30 }}
                        className="px-2.5 py-1 bg-gradient-to-r from-[#00d084] to-[#00a569] text-white text-[10px] font-black rounded-full uppercase shadow-sm"
                      >
                        Best
                      </motion.span>
                    )}
                  </div>
                  <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mt-0.5">
                    {quote.routes.length} route{quote.routes.length > 1 ? 's' : ''}
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
        })}
      </motion.div>
    </AnimatePresence>
  );
}
