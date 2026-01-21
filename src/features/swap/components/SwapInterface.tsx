"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TokenInput from "./TokenInput";
import DexQuoteList from "./DexQuoteList";
import { ExecuteSwapButton } from "./ExecuteSwapButton";
import { SwapModeToggle } from "./SwapModeToggle";
import { extractRawAmountOut } from "@/integrations/dex/suilend";
import { useSwapQuotes, useTokenSelection, useSwapExecution } from "../hooks";

interface SwapInterfaceProps {
  walletInfo: {
    address: string;
    email: string;
    privateKey?: string;
  };
}

export default function SwapInterface({ walletInfo }: SwapInterfaceProps) {
  const [amountIn, setAmountIn] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const {
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    tokenInBalance,
    tokenOutBalance,
    updateBalances,
    handleFlipTokens,
  } = useTokenSelection(walletInfo.address);

  const {
    loading: quotesLoading,
    quotes,
    selectedQuote,
    setSelectedQuote,
    error: quotesError,
    fetchQuotes,
  } = useSwapQuotes(tokenIn, tokenOut, amountIn);

  const {
    loading: executionLoading,
    swapData,
    setSwapData,
    error: executionError,
    handleBuildTransaction,
  } = useSwapExecution(walletInfo, tokenIn, tokenOut, amountIn, slippage, selectedQuote);

  const loading = quotesLoading || executionLoading;
  const error = quotesError || executionError;

  useEffect(() => {
    if (walletInfo.address) {
      fetchHistory();
      const interval = setInterval(() => {
        fetchHistory();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [walletInfo.address]);

  async function fetchHistory() {
    try {
      setHistoryLoading(true);
      const { getTransactionHistory } = await import("@/integrations/sui");
      const { SuiClient } = await import("@mysten/sui/client");
      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
      const res = await getTransactionHistory(client, walletInfo.address, 5);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setHistoryLoading(false);
    }
  }

  function handleMaxClick() {
    if (tokenIn && tokenInBalance) {
      setAmountIn(tokenInBalance);
    }
  }

  return (
    <div className="px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        {/* Left Column - Swap Interface */}
        <div className="space-y-6 max-w-[540px] mx-auto lg:mx-0">
          {/* Header with Toggle and Utility Icons */}
          <div className="flex items-center justify-between px-1">
            <SwapModeToggle activeMode="Instant" onModeChange={() => {}} />

            <div className="flex items-center gap-2">
              <button
                onClick={fetchQuotes}
                disabled={loading}
                className="p-2 text-[#94a3b8] hover:text-[#111827] hover:bg-white rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                <svg
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Swap Interface */}
          <div className="relative pt-2">
            <div className="space-y-2">
              {/* Token Input - Sell */}
              <TokenInput
                label="Sell"
                token={tokenIn}
                amount={amountIn}
                onAmountChange={setAmountIn}
                onTokenChange={setTokenIn}
                excludeToken={tokenOut}
                disabled={loading}
                balance={tokenInBalance}
                onMaxClick={handleMaxClick}
              />

              {/* Flip Button - Central Overlay */}
              <div className="absolute left-1/2 top-[46.5%] -translate-x-1/2 -translate-y-1/2 z-20">
                <button
                  onClick={handleFlipTokens}
                  disabled={loading}
                  className="bg-[#111827] text-white rounded-[14px] p-3 shadow-2xl shadow-black/20 border-[5px] border-white dark:border-[#111827] transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 group overflow-hidden"
                >
                  <svg
                    className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>
              </div>

              {/* Token Input - Buy */}
              <TokenInput
                label="Buy"
                token={tokenOut}
                amount={
                  selectedQuote && tokenOut
                    ? (
                        extractRawAmountOut(selectedQuote) / Math.pow(10, tokenOut.decimals)
                      ).toFixed(6)
                    : ""
                }
                onAmountChange={() => {}}
                onTokenChange={setTokenOut}
                excludeToken={tokenIn}
                disabled={true}
                readOnly={true}
                balance={tokenOutBalance}
              />
            </div>
          </div>

          {/* Exchange Rate Info */}
          <div className="pt-2">
            {tokenIn && tokenOut && selectedQuote && amountIn && parseFloat(amountIn) > 0 && (
              <div className="flex items-center justify-between px-2 text-[14px] font-bold text-[#94a3b8]">
                <div className="flex items-center gap-2 cursor-pointer hover:text-[#111827] transition-all group">
                  <span>
                    1 {tokenIn.symbol} ≈{" "}
                    {(
                      extractRawAmountOut(selectedQuote) /
                      Math.pow(10, tokenOut.decimals) /
                      parseFloat(amountIn)
                    ).toFixed(6)}{" "}
                    {tokenOut.symbol}
                  </span>
                  <svg
                    className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Main Action Button */}
          <div className="pt-4">
            {!walletInfo.address ? (
              <button className="w-full py-6 bg-[#00d084] hover:bg-[#00c07a] text-white text-[22px] font-black rounded-full shadow-xl shadow-[#00d084]/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] tracking-tight uppercase">
                Connect Wallet
              </button>
            ) : error ? (
              <button className="w-full py-5 bg-gray-100 text-[#64748b] text-[18px] font-black rounded-full cursor-not-allowed">
                {error}
              </button>
            ) : quotes.length > 0 && !swapData ? (
              <button
                onClick={handleBuildTransaction}
                disabled={loading}
                className="w-full py-6 bg-[#00d084] hover:bg-[#00c07a] text-white text-[18px] font-black rounded-full shadow-xl shadow-[#00d084]/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 tracking-tight uppercase"
              >
                {loading ? (
                  <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  `Swap with ${selectedQuote?.provider}`
                )}
              </button>
            ) : swapData ? (
              <ExecuteSwapButton
                swapData={swapData}
                walletInfo={walletInfo}
                onSuccess={() => {
                  setSwapData(null);
                  setSelectedQuote(null);
                  setAmountIn("");
                  updateBalances(); // Refresh balances after successful swap
                }}
                onBack={() => {
                  setSwapData(null);
                  setSelectedQuote(null);
                }}
              />
            ) : (
              <button
                disabled={!amountIn || loading}
                className="w-full py-6 bg-gray-100 text-[#94a3b8] text-[16px] font-black rounded-full disabled:opacity-50 uppercase tracking-tight"
              >
                Enter Amount
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Quotes & History */}
        <div className="space-y-6 overflow-hidden">
          {/* Quotes & Routing Section */}
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
                      className="w-6 h-6 text-[#00d084] rotate-45"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 p-2 px-3 bg-gradient-to-r from-[#00d084] to-[#00a569] text-white rounded-full shadow-md">
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
                  onSelectQuote={setSelectedQuote}
                  loading={loading}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* History Section */}
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
                    onClick={fetchHistory}
                    disabled={historyLoading}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-[#94a3b8] hover:text-[#00d084] transition-colors disabled:opacity-50"
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${historyLoading ? "animate-spin" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {historyLoading ? "Refreshing..." : "Refresh"}
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
                        className="text-[#00d084] hover:underline text-[12px] font-black"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
