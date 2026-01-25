"use client";

import { useTransactions } from "@/features/wallet";
import { useRefresh } from "@/shared/hooks";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import ActivityTableEmpty from "./ActivityTableEmpty";
import ActivityTableError from "./ActivityTableError";
import ActivityTableFooter from "./ActivityTableFooter";
import ActivityTableHeader from "./ActivityTableHeader";
import ActivityTableSkeleton from "./ActivityTableSkeleton";
import TransactionRow from "./TransactionRow";

export default function ActivityTable() {
  const { transactions, loading, error, hasNextPage, loadMore, refresh } = useTransactions(10);
  const { refreshing, handleRefresh } = useRefresh(refresh);
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    await loadMore();
    setLoadingMore(false);
  };

  const renderContent = () => {
    if (loading && transactions.length === 0) {
      return <ActivityTableSkeleton />;
    }

    if (transactions.length === 0) {
      return <ActivityTableEmpty />;
    }

    return (
      <AnimatePresence initial={false}>
        {transactions.map((tx) => (
          <TransactionRow key={tx.digest} transaction={tx} />
        ))}
      </AnimatePresence>
    );
  };

  return (
    <div>
      <ActivityTableHeader
        loading={loading}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />

      <ActivityTableError error={error} />

      <div className="space-y-3">{renderContent()}</div>

      <ActivityTableFooter
        transactionCount={transactions.length}
        hasNextPage={hasNextPage}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
