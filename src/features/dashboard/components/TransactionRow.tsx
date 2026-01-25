"use client";

import { ExternalLink, ArrowDownLeft, ArrowUpRight, Repeat } from "lucide-react";
import { TransactionSummary } from "@/integrations/sui/history";
import { getTransactionExplorerUrl } from "@/integrations/sui/history";
import { CoinIcon } from "@/features/wallet";
import { motion } from "framer-motion";

interface TransactionRowProps {
  transaction: TransactionSummary;
}

export default function TransactionRow({ transaction }: TransactionRowProps) {
  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    return `${days} days ago`;
  };

  const getTypeIcon = (type: TransactionSummary["type"]) => {
    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-4 h-4" />;
      case "received":
        return <ArrowDownLeft className="w-4 h-4" />;
      case "contract":
        return <Repeat className="w-4 h-4" />;
      default:
        return <Repeat className="w-4 h-4" />;
    }
  };

  const getIconStyles = (type: TransactionSummary["type"]) => {
    switch (type) {
      case "sent":
        return "bg-rose-100 text-rose-500";
      case "received":
        return "bg-emerald-100 text-emerald-500";
      case "contract":
        return "bg-blue-100 text-blue-500";
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getTypeLabel = (type: TransactionSummary["type"]) => {
    switch (type) {
      case "sent":
        return "Send";
      case "received":
        return "Receive";
      case "contract":
        return "Swap";
      default:
        return "Transaction";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="group relative bg-gray-50 hover:bg-gray-100/70 rounded-2xl p-4 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Icon + Type + Time */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`p-2 rounded-xl ${getIconStyles(transaction.type)}`}>
            {getTypeIcon(transaction.type)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-secondary">{getTypeLabel(transaction.type)}</h4>
              <span className="text-xs text-primary font-medium px-2 py-0.5 bg-primary/10 rounded">
                {transaction.symbol || "SUI"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(transaction.timestamp)}</p>
          </div>
        </div>

        {/* Right: Amount + Status */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            {transaction.amountFormatted ? (
              <p
                className={`text-base font-bold tabular-nums ${
                  transaction.type === "sent" ? "text-rose-500" : "text-emerald-500"
                }`}
              >
                {transaction.type === "sent" ? "-" : "+"}
                {transaction.amountFormatted} {transaction.symbol}
              </p>
            ) : (
              <p className="text-sm text-gray-400">N/A</p>
            )}
            <div className="flex items-center justify-end gap-1.5 mt-1">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  transaction.status === "success" ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              <span className="text-xs text-gray-500">
                {transaction.status === "success" ? "Completed" : "Pending"}
              </span>
              <a
                href={getTransactionExplorerUrl(transaction.digest, "mainnet")}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-gray-400 hover:text-primary transition-colors"
                title="View in Explorer"
              >
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
