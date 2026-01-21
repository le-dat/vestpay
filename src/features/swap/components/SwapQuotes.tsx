/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";
import DexQuoteList from "./DexQuoteList";

interface SwapQuotesProps {
  quotes: any[];
  tokenOut: any;
  selectedQuote: any;
  onSelectQuote: (quote: any) => void;
  loading: boolean;
}

export function SwapQuotes({
  quotes,
  tokenOut,
  selectedQuote,
  onSelectQuote,
  loading,
}: SwapQuotesProps) {
  return (
    <AnimatePresence>
      {quotes.length > 0 && (
        <motion.div
          key="quotes-section"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{
            duration: 0.4,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-primary rotate-45"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 p-2 px-3 bg-linear-to-r from-primary to-[#00a569] text-white rounded-full shadow-md">
                  <span className="text-[12px] font-black">{quotes.length}</span>
                  <span className="text-[10px]">•</span>
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-[11px] font-bold text-white/90 uppercase tracking-tight">
                    Best Routes
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DexQuoteList
            quotes={quotes}
            tokenOut={tokenOut!}
            selectedQuote={selectedQuote}
            onSelectQuote={onSelectQuote}
            loading={loading}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
