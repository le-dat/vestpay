"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TokenInput from "./TokenInput";
import DexQuoteList from "./DexQuoteList";
import { ExecuteSwapButton } from "./ExecuteSwapButton";
import { SwapModeToggle } from "./SwapModeToggle";
import { getSwapQuotes, extractRawAmountOut } from "@/lib/suilend/core/quote";
import { buildSwapTransactionFromQuote, createTokenObject } from "@/lib/suilend/core/transaction";
import type { StandardizedQuote } from "@suilend/sdk";
import type { ISwapTransactionResponse } from "@/lib/suilend";
import type { CetusToken } from "@/lib/suilend/core/tokens";
import { fetchCetusTokens } from "@/lib/suilend/core/tokens";

interface SwapInterfaceProps {
  walletInfo: {
    address: string;
    email: string;
    privateKey?: string;
  };
}

export default function SwapInterface({ walletInfo }: SwapInterfaceProps) {
  const [tokenIn, setTokenIn] = useState<CetusToken | null>(null);
  const [tokenOut, setTokenOut] = useState<CetusToken | null>(null);
  const [amountIn, setAmountIn] = useState("");
  const [slippage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<StandardizedQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<StandardizedQuote | null>(null);
  const [swapData, setSwapData] = useState<ISwapTransactionResponse | null>(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [tokenInBalance, setTokenInBalance] = useState<string>("");
  const [tokenOutBalance, setTokenOutBalance] = useState<string>("");
  const [historyLoading, setHistoryLoading] = useState(false);

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
      const { getTransactionHistory } = await import("@/lib/sui/history");
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

  async function fetchTokenBalance(coinType: string): Promise<string> {
    try {
      const { SuiClient } = await import("@mysten/sui/client");
      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
      const balance = await client.getBalance({
        owner: walletInfo.address,
        coinType: coinType,
      });
      return balance.totalBalance;
    } catch (err) {
      return "0";
    }
  }

  async function updateBalances() {
    if (!tokenIn || !tokenOut) return;
    const [inBalance, outBalance] = await Promise.all([
      fetchTokenBalance(tokenIn.coinType),
      fetchTokenBalance(tokenOut.coinType),
    ]);
    const inBalanceFormatted = (Number(inBalance) / Math.pow(10, tokenIn.decimals)).toFixed(6);
    const outBalanceFormatted = (Number(outBalance) / Math.pow(10, tokenOut.decimals)).toFixed(6);
    setTokenInBalance(inBalanceFormatted);
    setTokenOutBalance(outBalanceFormatted);
  }

  useEffect(() => {
    loadDefaultTokens();
  }, []);

  useEffect(() => {
    if (tokenIn && tokenOut && walletInfo.address) {
      updateBalances();
    }
  }, [tokenIn?.coinType, tokenOut?.coinType, walletInfo.address]);

  async function loadDefaultTokens() {
    try {
      const tokens = await fetchCetusTokens();
      const sui = tokens.find((t) => t.symbol === "SUI");
      const usdc = tokens.find((t) => t.symbol === "USDC");
      if (sui) setTokenIn(sui);
      if (usdc) setTokenOut(usdc);
    } catch (error) {
      console.error("Failed to load default tokens:", error);
    }
  }

  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0 && tokenIn && tokenOut) {
      const timer = setTimeout(() => {
        fetchQuotes();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setQuotes([]);
      setSelectedQuote(null);
      setSwapData(null);
    }
  }, [amountIn, tokenIn?.coinType, tokenOut?.coinType]);

  async function fetchQuotes() {
    if (!tokenIn || !tokenOut) return;
    setLoading(true);
    setError("");
    setQuotes([]);
    setSelectedQuote(null);
    setSwapData(null);
    try {
      const tokenInObj = createTokenObject(tokenIn.coinType);
      const tokenOutObj = createTokenObject(tokenOut.coinType);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);
      const allQuotes = await getSwapQuotes(tokenInObj, tokenOutObj, amount.toString());
      setQuotes(allQuotes);
      if (allQuotes.length > 0) {
        setSelectedQuote(allQuotes[0]);
      } else {
        setError("No routes available for this pair.");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get quotes";
      if (!errorMsg.includes("timeout") && !errorMsg.includes("1500ms")) {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectQuote(quote: StandardizedQuote) {
    setSelectedQuote(quote);
  }

  async function handleBuildTransaction() {
    if (!selectedQuote || !tokenIn || !tokenOut) return;
    setLoading(true);
    setError("");
    try {
      const currentNetwork =
        typeof window !== "undefined"
          ? localStorage.getItem("sui-network") || "mainnet"
          : "mainnet";
      if (currentNetwork !== "mainnet") {
        setError("Swap is only available on Mainnet.");
        setLoading(false);
        return;
      }
      const tokenInObj = createTokenObject(tokenIn.coinType);
      const tokenOutObj = createTokenObject(tokenOut.coinType);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);
      const slippagePercent = slippage;
      const { SuiClient } = await import("@mysten/sui/client");
      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
      const balance = await client.getBalance({
        owner: walletInfo.address,
        coinType: tokenIn.coinType,
      });
      const balanceAmount = BigInt(balance.totalBalance);
      const requiredAmount = BigInt(Math.floor(amount));

      if (balanceAmount < requiredAmount) {
        setError(`Insufficient ${tokenIn.symbol} balance.`);
        setLoading(false);
        return;
      }
      const result = await buildSwapTransactionFromQuote(
        walletInfo.address,
        tokenInObj,
        tokenOutObj,
        amount.toString(),
        slippagePercent,
        selectedQuote,
        undefined,
      );
      const minAmountOut = Math.floor(result.estimatedAmountOut * (1 - slippagePercent / 100));
      const routes = selectedQuote.routes.map((route) => ({
        percent: route.percent.toNumber(),
        path: route.path.map((step) => ({
          provider: step.provider,
          poolId: step.poolId,
          from: { coinType: step.in.coinType, amount: step.in.amount.toString() },
          to: { coinType: step.out.coinType, amount: step.out.amount.toString() },
        })),
      }));

      setSwapData({
        transaction: result.transaction,
        rebuildParams: {
          userAddress: walletInfo.address,
          tokenInType: tokenIn.coinType,
          tokenOutType: tokenOut.coinType,
          amountIn: amount.toString(),
          slippagePercent,
          rawQuote: selectedQuote,
        },
        quote: {
          provider: selectedQuote.provider,
          amountOut: result.estimatedAmountOut,
          amountOutFormatted: `${(result.estimatedAmountOut / Math.pow(10, tokenOut.decimals)).toFixed(6)} ${tokenOut.symbol}`,
          exchangeRate: result.estimatedAmountOut / amount,
          routes,
        },
        slippage: {
          tolerance: slippagePercent,
          minAmountOut,
          minAmountOutFormatted: `${(minAmountOut / Math.pow(10, tokenOut.decimals)).toFixed(6)} ${tokenOut.symbol}`,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to build transaction");
    } finally {
      setLoading(false);
    }
  }

  function handleMaxClick() {
    if (tokenIn && tokenInBalance) {
      setAmountIn(tokenInBalance);
    }
  }

  function handleFlipTokens() {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setQuotes([]);
    setSelectedQuote(null);
    setSwapData(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
        {/* Left Column - Swap Interface */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <SwapModeToggle activeMode="Instant" onModeChange={() => {}} />
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchQuotes}
                disabled={loading}
                className="p-2.5 bg-white dark:bg-white/5 text-[#94a3b8] hover:text-[#00d084] rounded-xl border border-gray-100 dark:border-white/10 transition-all shadow-sm group"
              >
                <svg
                  className={`w-5 h-5 ${loading ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-500`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </motion.button>
            </div>
          </div>

          <div className="relative space-y-3">
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

            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.button
                whileHover={{ scale: 1.15, rotate: 180 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFlipTokens}
                disabled={loading}
                className="bg-[#111827] text-white p-3.5 rounded-2xl shadow-2xl shadow-[#00d084]/20 border-4 border-white dark:border-[#0b0f19] transition-all disabled:opacity-50 group"
              >
                <svg
                  className="w-6 h-6 text-[#00d084] group-hover:scale-110 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </motion.button>
            </div>

            <TokenInput
              label="Buy"
              token={tokenOut}
              amount={
                selectedQuote && tokenOut
                  ? (extractRawAmountOut(selectedQuote) / Math.pow(10, tokenOut.decimals)).toFixed(
                      6,
                    )
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

          {tokenIn && tokenOut && selectedQuote && amountIn && parseFloat(amountIn) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between px-5 py-4 bg-white/50 dark:bg-white/5 backdrop-blur-sm rounded-[24px] border border-gray-100 dark:border-white/10 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-[#00d084] rounded-full animate-pulse" />
                <span className="text-[13px] font-black text-[#111827] dark:text-white uppercase tracking-tight">
                  1 {tokenIn.symbol} ={" "}
                  {(
                    extractRawAmountOut(selectedQuote) /
                    Math.pow(10, tokenOut.decimals) /
                    parseFloat(amountIn)
                  ).toFixed(6)}{" "}
                  {tokenOut.symbol}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-[#94a3b8] uppercase tracking-wider">
                  Live Rate
                </span>
                <span className="text-[10px] font-black text-[#00d084] bg-[#00d084]/10 px-2 py-0.5 rounded-full uppercase">
                  Best
                </span>
              </div>
            </motion.div>
          )}

          <div className="pt-2">
            {!walletInfo.address ? (
              <button className="w-full py-6 bg-[#00d084] text-white text-[20px] font-black rounded-[28px] shadow-xl shadow-[#00d084]/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-tight">
                Connect Wallet
              </button>
            ) : error ? (
              <div className="w-full p-6 bg-red-50 dark:bg-red-500/5 border-2 border-red-100 dark:border-red-500/10 text-red-500 text-[14px] font-black rounded-[28px] text-center uppercase tracking-tight">
                {error}
              </div>
            ) : quotes.length > 0 && !swapData ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleBuildTransaction}
                disabled={loading}
                className="group relative w-full py-7 bg-gradient-to-r from-[#00d084] to-[#00a569] text-white text-[19px] font-black rounded-[28px] shadow-2xl shadow-[#00d084]/30 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex items-center justify-center gap-4 uppercase tracking-[0.05em]">
                  {loading ? (
                    <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Preview Swap
                      <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="3"
                      >
                        <path d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </div>
              </motion.button>
            ) : swapData ? (
              <ExecuteSwapButton
                swapData={swapData}
                walletInfo={walletInfo}
                onSuccess={() => {
                  setSwapData(null);
                  setSelectedQuote(null);
                  setAmountIn("");
                  updateBalances();
                  fetchHistory();
                }}
                onBack={() => {
                  setSwapData(null);
                  setSelectedQuote(null);
                }}
              />
            ) : (
              <button
                disabled
                className="w-full py-6 bg-gray-50 dark:bg-white/5 text-[#94a3b8] text-[16px] font-black rounded-[28px] uppercase tracking-widest border border-gray-100 dark:border-white/5 transition-all"
              >
                {loading ? "Calculating Routes..." : amountIn ? "Searching..." : "Enter Amount"}
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Quotes & History */}
        <div className="space-y-6">
          <DexQuoteList
            quotes={quotes}
            tokenOut={tokenOut}
            selectedQuote={selectedQuote}
            onSelectQuote={handleSelectQuote}
            loading={loading}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-white/5 rounded-[32px] border border-gray-100 dark:border-white/10 p-7 flex flex-col gap-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#00d084]/10 flex items-center justify-center border border-[#00d084]/20">
                  <svg
                    className="w-5 h-5 text-[#00d084]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.5"
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[16px] font-black text-[#111827] dark:text-white uppercase tracking-tight block">
                    Activity History
                  </span>
                  <span className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-wider">
                    Syncing Live
                  </span>
                </div>
              </div>
              <button
                onClick={fetchHistory}
                disabled={historyLoading}
                className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all"
              >
                <svg
                  className={`w-4 h-4 text-[#94a3b8] ${historyLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            <div className="space-y-3 relative">
              {historyLoading && !history.length && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/20 backdrop-blur-[1px] z-10 rounded-[20px]">
                  <div className="w-8 h-8 border-3 border-[#00d084]/20 border-t-[#00d084] rounded-full animate-spin" />
                </div>
              )}

              {history.length > 0
                ? history.map((tx, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-gray-50/50 dark:bg-white/[0.02] p-4 rounded-[22px] border border-gray-100 dark:border-white/5 hover:border-[#00d084]/30 hover:shadow-lg hover:shadow-[#00d084]/5 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center shadow-sm">
                            <svg
                              className="w-5 h-5 text-[#00d084] group-hover:scale-110 transition-transform"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              strokeWidth="2.5"
                            >
                              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-[14px] font-black text-[#111827] dark:text-white uppercase leading-none">
                              Swap Transaction
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[11px] font-black text-[#94a3b8] uppercase tracking-wider">
                                {new Date(Number(tx.timestampMs)).toLocaleDateString()}
                              </span>
                              <div className="w-1 h-1 bg-gray-300 dark:bg-white/20 rounded-full" />
                              <span className="text-[11px] font-black text-[#00d084] uppercase tracking-wider">
                                Success
                              </span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={`https://suiscan.xyz/mainnet/tx/${tx.digest}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-[#94a3b8] hover:text-[#00d084] hover:border-[#00d084]/50 transition-all shadow-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="3"
                          >
                            <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </motion.div>
                  ))
                : !historyLoading && (
                    <div className="py-12 bg-gray-50/50 dark:bg-white/5 rounded-[24px] border border-dashed border-gray-200 dark:border-white/10 text-center">
                      <div className="w-14 h-14 bg-white dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100 dark:border-white/10 shadow-sm">
                        <svg
                          className="w-7 h-7 text-[#94a3b8]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2" />
                        </svg>
                      </div>
                      <span className="text-[13px] font-black text-[#94a3b8] uppercase tracking-[0.1em]">
                        No recent transactions
                      </span>
                    </div>
                  )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
