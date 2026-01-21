"use client";

import { ChevronDown, RefreshCw, History, ArrowRight } from "lucide-react";
import { useTransactions } from "@/features/wallet";
import { useRefresh } from "@/shared/hooks";
import TransactionRow from "./TransactionRow";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ActivityTable() {
  const { transactions, loading, error, hasNextPage, loadMore, refresh } = useTransactions(10);
  const { refreshing, handleRefresh } = useRefresh(refresh);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  return (
    <div className="bg-white border border-gray-100/80 rounded-[32px] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-500">
      <div className="p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl shadow-inner">
              <History className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-secondary tracking-tight">Recent Activity</h3>
              <p className="text-sm font-medium text-gray-400">Your latest on-chain transactions</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="p-3 hover:bg-gray-50 active:scale-95 rounded-2xl transition-all disabled:opacity-50 border border-gray-100 hover:border-gray-200"
              title="Refresh transactions"
            >
              <RefreshCw
                className={`w-5 h-5 text-gray-400 ${
                  refreshing || loading ? "animate-spin text-primary" : ""
                }`}
              />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-sm text-rose-700 font-bold">
                Failed to load transactions: {error}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide">
          <table className="w-full text-left border-separate border-spacing-y-1">
            <thead>
              <tr className="text-[12px] font-black text-gray-400 uppercase tracking-widest">
                <th className="pb-6 pl-6">Transaction</th>
                <th className="pb-6">Date</th>
                <th className="pb-6">Status</th>
                <th className="pb-6 text-right">Amount</th>
                <th className="pb-6 pr-6 text-right">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {loading && transactions.length === 0 ? (
                <LoadingSkeleton />
              ) : transactions.length === 0 ? (
                <EmptyState />
              ) : (
                <AnimatePresence initial={false}>
                  {transactions.map((tx) => (
                    <TransactionRow key={tx.digest} transaction={tx} />
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {(hasNextPage || transactions.length > 5) && (
          <div className="mt-10 flex items-center justify-between pt-8 border-t border-gray-50">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Showing {transactions.length} transactions
            </p>
            {hasNextPage && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="group flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-gray-800 rounded-2xl text-sm font-bold text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-50"
              >
                {loadingMore ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Load More</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="group">
          <td className="py-5 pl-6 bg-gray-50/50 rounded-l-2xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-3 w-24 bg-gray-50 rounded-lg animate-pulse" />
              </div>
            </div>
          </td>
          <td className="py-5 bg-gray-50/50">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-3 w-16 bg-gray-50 rounded-lg animate-pulse" />
            </div>
          </td>
          <td className="py-5 bg-gray-50/50">
            <div className="h-7 w-24 bg-gray-100 rounded-full animate-pulse" />
          </td>
          <td className="py-5 bg-gray-50/50 text-right">
            <div className="h-5 w-24 bg-gray-100 rounded-lg animate-pulse ml-auto" />
          </td>
          <td className="py-5 pr-6 bg-gray-50/50 rounded-r-2xl text-right">
            <div className="h-10 w-10 bg-gray-100 rounded-xl animate-pulse ml-auto" />
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={5} className="py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="p-6 bg-gray-50 rounded-full border-4 border-white shadow-inner">
            <History className="w-10 h-10 text-gray-200" />
          </div>
          <div className="space-y-2">
            <p className="text-xl font-bold text-secondary">No Activity Recorded</p>
            <p className="text-gray-400 text-sm max-w-xs mx-auto">
              Your transaction history will appear here once you start using your wallet.
            </p>
          </div>
        </motion.div>
      </td>
    </tr>
  );
}
