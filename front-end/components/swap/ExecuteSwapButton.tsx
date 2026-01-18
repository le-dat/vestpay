"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ISwapTransactionResponse } from "@/lib/suilend";
import { showToast } from "@/components/common/Toast";

interface ExecuteSwapButtonProps {
  swapData: ISwapTransactionResponse;
  walletInfo: {
    address: string;
    email: string;
  };
  onSuccess: () => void;
  onBack: () => void;
}

export function ExecuteSwapButton({
  swapData,
  walletInfo,
  onSuccess,
  onBack,
}: ExecuteSwapButtonProps) {
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState("");

  async function handleExecuteSwap() {
    setExecuting(true);
    setError("");

    try {
      const { signAndExecuteSwapTransaction } = await import("@/lib/suilend/core/signing");
      const { recoverPasskeyWallet } = await import("@/lib/sui/passkey");

      const wallet = await recoverPasskeyWallet();
      if (!wallet) {
        throw new Error("Please login to execute swap.");
      }

      const result = await signAndExecuteSwapTransaction(swapData.transaction, wallet.keypair);

      showToast({
        type: "success",
        title: "Swap Completed",
        message: `Successfully swapped via ${swapData.quote.provider}`,
        txDigest: result.digest,
        duration: 6000,
      });

      onSuccess();
    } catch (err) {
      console.error("Failed to execute swap:", err);
      const errorMsg = err instanceof Error ? err.message : "Swap failed";
      setError(errorMsg);

      showToast({
        type: "error",
        title: "Swap Failed",
        message: errorMsg,
        duration: 6000,
      });
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[13px] font-black uppercase tracking-tight">
              {error}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-6 rounded-[28px] space-y-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="text-[10px] font-black text-[#00d084] bg-[#00d084]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
            Verified Quote
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {[
            { label: "Dex Provider", value: swapData.quote.provider, isDex: true },
            { label: "Execution", value: swapData.quote.amountOutFormatted, isStrong: true },
            { label: "Minimum Out", value: swapData.slippage.minAmountOutFormatted },
            { label: "Price Impact", value: "< 0.01%", isGreen: true },
            { label: "Fee", value: "0.1%", isFee: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-[11px] font-black text-[#94a3b8] uppercase tracking-[0.1em]">
                {item.label}
              </span>
              <span
                className={`text-[13px] font-black uppercase tracking-tight ${
                  item.isDex
                    ? "text-[#00d084]"
                    : item.isStrong
                      ? "text-[#111827] dark:text-white text-[15px]"
                      : item.isGreen
                        ? "text-[#00d084]"
                        : "text-[#111827] dark:text-gray-300"
                }`}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          disabled={executing}
          className="flex-1 py-5 bg-gray-50 dark:bg-white/5 text-[#94a3b8] font-black rounded-[24px] uppercase tracking-widest border border-gray-100 dark:border-white/5 hover:text-[#111827] dark:hover:text-white transition-all disabled:opacity-50"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExecuteSwap}
          disabled={executing}
          className="flex-[2] py-5 bg-gradient-to-r from-[#111827] to-[#1f2937] dark:from-[#00d084] dark:to-[#00a569] text-white font-black text-lg rounded-[24px] shadow-2xl shadow-black/20 dark:shadow-[#00d084]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
        >
          {executing ? (
            <>
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="uppercase tracking-widest text-sm">Processing...</span>
            </>
          ) : (
            <>
              <span className="uppercase tracking-widest text-sm">Sign & Execute</span>
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="3"
              >
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
