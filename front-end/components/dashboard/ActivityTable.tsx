"use client";

import { ChevronDown, RefreshCw, History } from "lucide-react";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useRefresh } from "@/lib/hooks/useRefresh";
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
    <div className="bg-white border border-gray-100/80 rounded-[32px] p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <History className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-gray-900 to-gray-600">
            Activity
          </h3>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="p-2.5 hover:bg-gray-50 active:scale-95 rounded-full transition-all disabled:opacity-50 border border-transparent hover:border-gray-100"
            title="Refresh transactions"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-400 ${
                refreshing || loading ? "animate-spin text-primary" : ""
              }`}
            />
          </button>
          <button className="flex flex-1 sm:flex-none items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 hover:bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-600 transition-all hover:shadow-sm">
            <span>Newest First</span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-8 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <p className="text-sm text-red-600 font-medium">Failed to load transactions: {error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-x-auto -mx-2 px-2 scrollbar-hide">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              <th className="pb-4 pl-4">Date & Time</th>
              <th className="pb-4">Details</th>
              <th className="pb-4">Status</th>
              <th className="pb-4 text-right">Amount</th>
              <th className="pb-4 pr-4 text-right">Action</th>
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

      {hasNextPage && !loading && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="group px-8 py-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 transition-all hover:shadow-sm active:scale-95 disabled:opacity-50"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                <span>Loading more...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Load More</span>
                <ChevronDown className="w-4 h-4 text-gray-400 group-hover:translate-y-0.5 transition-transform" />
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="group">
          <td className="py-4 pl-4 bg-gray-50/30 rounded-l-2xl">
            <div className="h-4 w-28 bg-gray-100 rounded-lg animate-pulse" />
          </td>
          <td className="py-4 bg-gray-50/30">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-gray-100 rounded-lg animate-pulse" />
              <div className="h-3 w-48 bg-gray-50 rounded-lg animate-pulse" />
            </div>
          </td>
          <td className="py-4 bg-gray-50/30">
            <div className="h-7 w-20 bg-gray-100 rounded-full animate-pulse" />
          </td>
          <td className="py-4 bg-gray-50/30">
            <div className="h-4 w-24 bg-gray-100 rounded-lg animate-pulse ml-auto" />
          </td>
          <td className="py-4 pr-4 bg-gray-50/30 rounded-r-2xl text-right">
            <div className="h-4 w-12 bg-gray-100 rounded-lg animate-pulse ml-auto" />
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
          className="flex flex-col items-center gap-4"
        >
          <div className="p-4 bg-gray-50 rounded-full">
            <History className="w-8 h-8 text-gray-300" />
          </div>
          <div className="space-y-1">
            <p className="text-gray-900 font-bold">No activity yet</p>
            <p className="text-gray-400 text-sm">Your transaction history will appear here</p>
          </div>
        </motion.div>
      </td>
    </tr>
  );
}
