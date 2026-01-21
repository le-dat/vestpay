"use client";

import { ExternalLink, ArrowDownLeft, ArrowUpRight, FileCode } from "lucide-react";
import { TransactionSummary } from "@/integrations/sui/history";
import { getTransactionExplorerUrl } from "@/integrations/sui/history";
import { useNetwork } from "@/shared/contexts";
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
        return <ArrowUpRight className="w-4 h-4 text-white" />;
      case "received":
        return <ArrowDownLeft className="w-4 h-4 text-white" />;
      case "contract":
        return <FileCode className="w-4 h-4 text-white" />;
      default:
        return <FileCode className="w-4 h-4 text-white" />;
    }
  };

  const getIconBg = (type: TransactionSummary["type"]) => {
    switch (type) {
      case "sent":
        return "bg-rose-500 shadow-rose-200";
      case "received":
        return "bg-emerald-500 shadow-emerald-200";
      case "contract":
        return "bg-blue-500 shadow-blue-200";
      default:
        return "bg-gray-500 shadow-gray-200";
    }
  };

  const getTypeLabel = (type: TransactionSummary["type"]) => {
    switch (type) {
      case "sent":
        return "Sent Assets";
      case "received":
        return "Received Assets";
      case "contract":
        return "Smart Contract";
      default:
        return "Unknown";
    }
  };

  return (
    <motion.tr
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group hover:bg-gray-50/50 transition-all duration-300"
    >
      <td className="py-5 pl-6 rounded-l-2xl">
        <div className="flex items-center gap-4">
          <div
            className={`p-2.5 rounded-xl shadow-lg transition-transform group-hover:scale-110 ${getIconBg(transaction.type)}`}
          >
            {getTypeIcon(transaction.type)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-secondary">
              {getTypeLabel(transaction.type)}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-1">
              {transaction.type === "sent" && transaction.to
                ? `To: ${formatAddress(transaction.to)}`
                : transaction.type === "received" && transaction.from
                  ? `From: ${formatAddress(transaction.from)}`
                  : `TX: ${formatAddress(transaction.digest)}`}
            </span>
          </div>
        </div>
      </td>

      <td className="py-5">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-secondary tracking-tight">
            {formattedDate.date}
          </span>
          <span className="text-[11px] font-medium text-gray-400 tabular-nums">
            {formattedDate.time}
          </span>
        </div>
      </td>

      <td className="py-5">
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border shadow-xs transition-all
          ${
            transaction.status === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-100/50"
              : "bg-rose-50 text-rose-700 border-rose-100/50"
          }`}
        >
          {transaction.status === "success" ? (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          )}
          <span className="text-[9px] font-black uppercase tracking-widest">
            {transaction.status === "success" ? "Confirmed" : "Failed"}
          </span>
        </div>
      </td>

      <td className="py-5 text-right">
        {transaction.amountFormatted ? (
          <div className="flex flex-col items-end">
            <span
              className={`text-base font-black tabular-nums tracking-tight ${
                transaction.type === "sent" ? "text-rose-500" : "text-emerald-500"
              }`}
            >
              {transaction.type === "sent" ? "-" : "+"}
              {transaction.amountFormatted}{" "}
              <span className="text-[10px] ml-0.5">{transaction.symbol}</span>
            </span>
            {transaction.gasFeeFormatted && (
              <span className="text-[10px] font-medium text-gray-400 tracking-tighter">
                Gas: {transaction.gasFeeFormatted} SUI
              </span>
            )}
          </div>
        ) : (
          <span className="text-sm font-bold text-gray-300">N/A</span>
        )}
      </td>

      <td className="py-5 pr-6 rounded-r-2xl text-right">
        <a
          href={getTransactionExplorerUrl(transaction.digest, network)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-gray-300 hover:text-primary hover:bg-primary/5 hover:border-primary/10 border border-transparent transition-all active:scale-90"
          title="View in Explorer"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </td>
    </motion.tr>
  );
}
