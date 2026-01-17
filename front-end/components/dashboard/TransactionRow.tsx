"use client";

import {
  ExternalLink,
  ArrowDownLeft,
  ArrowUpRight,
  FileCode,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { TransactionSummary } from "@/lib/sui/history";
import { getTransactionExplorerUrl } from "@/lib/sui/history";
import { useNetwork } from "@/lib/context/NetworkContext";
import { motion } from "framer-motion";

interface TransactionRowProps {
  transaction: TransactionSummary;
}

export default function TransactionRow({ transaction }: TransactionRowProps) {
  const { network } = useNetwork();

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return {
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date),
      time: new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(date),
    };
  };

  const formatAddress = (address?: string) => {
    if (!address) return "Unknown";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formattedDate = formatDate(transaction.timestamp);

  const getTypeIcon = (type: TransactionSummary["type"]) => {
    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-4 h-4 text-rose-500" />;
      case "received":
        return <ArrowDownLeft className="w-4 h-4 text-emerald-500" />;
      case "contract":
        return <FileCode className="w-4 h-4 text-blue-500" />;
      default:
        return <FileCode className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: TransactionSummary["type"]) => {
    switch (type) {
      case "sent":
        return "Sent";
      case "received":
        return "Received";
      case "contract":
        return "Interaction";
      default:
        return "Unknown";
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group hover:bg-gray-50/80 transition-all duration-200"
    >
      <td className="py-4 pl-4 rounded-l-2xl">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-gray-900">{formattedDate.date}</span>
          <span className="text-[11px] font-medium text-gray-400 tabular-nums">
            {formattedDate.time}
          </span>
        </div>
      </td>

      <td className="py-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl bg-gray-50 group-hover:bg-white border border-transparent group-hover:border-gray-100 transition-colors`}
          >
            {getTypeIcon(transaction.type)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-gray-900">
              {getTypeLabel(transaction.type)}
            </span>
            <span className="text-[11px] font-medium text-gray-400 font-mono">
              {transaction.type === "sent" && transaction.to
                ? `To: ${formatAddress(transaction.to)}`
                : transaction.type === "received" && transaction.from
                  ? `From: ${formatAddress(transaction.from)}`
                  : `TX: ${formatAddress(transaction.digest)}`}
            </span>
          </div>
        </div>
      </td>

      <td className="py-4">
        <div
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm/5 transition-all
          ${
            transaction.status === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
              : "bg-rose-50 text-rose-700 border-rose-100/50"
          }`}
        >
          {transaction.status === "success" ? (
            <CheckCircle2 className="w-3 h-3" />
          ) : (
            <XCircle className="w-3 h-3" />
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {transaction.status === "success" ? "Success" : "Failed"}
          </span>
        </div>
      </td>

      <td className="py-4 text-right">
        {transaction.amountFormatted ? (
          <div className="flex flex-col items-end gap-0.5">
            <span
              className={`text-sm font-extrabold tabular-nums ${
                transaction.type === "sent" ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {transaction.type === "sent" ? "-" : "+"}
              {transaction.amountFormatted} {transaction.symbol}
            </span>
            {transaction.gasFeeFormatted && (
              <span className="text-[10px] font-medium text-gray-400 tabular-nums">
                Fee: {transaction.gasFeeFormatted} SUI
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm font-bold text-gray-400">Interaction</span>
        )}
      </td>

      <td className="py-4 pr-4 rounded-r-2xl text-right">
        <a
          href={getTransactionExplorerUrl(transaction.digest, network)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-primary/10 transition-all active:scale-90"
          title="View in Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </td>
    </motion.tr>
  );
}
