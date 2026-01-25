/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion, AnimatePresence } from "framer-motion";

interface SwapHistoryProps {
  history: any[];
  loading: boolean;
  onRefresh: () => void;
}

export function SwapHistory({ history, loading, onRefresh }: SwapHistoryProps) {
  return (
    <AnimatePresence>
      {history.length > 0 && (
        <motion.div
          key="history-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#94a3b8]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[15px] font-black text-[#111827] dark:text-white">
                Swap History
              </span>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 text-[12px] font-bold text-[#94a3b8] hover:text-primary transition-colors disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <div className="space-y-2">
            {history.map((tx, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-white/5 p-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-[#94a3b8]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[14px] font-black text-[#111827] dark:text-white">
                      Swap Transaction
                    </div>
                    <div className="text-[12px] font-bold text-[#94a3b8]">
                      {new Date(Number(tx.timestampMs)).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://suiscan.xyz/mainnet/tx/${tx.digest}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-[12px] font-black"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
