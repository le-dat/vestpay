'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TokenInput from './TokenInput';
import DexQuoteList from './DexQuoteList';
import { ExecuteSwapButton } from './ExecuteSwapButton';
import { SwapModeToggle } from './SwapModeToggle';
import { getSwapQuotes, extractRawAmountOut } from '@/lib/suilend/core/quote';
import { buildSwapTransactionFromQuote, createTokenObject } from '@/lib/suilend/core/transaction';
import type { StandardizedQuote } from '@suilend/sdk';
import type { ISwapTransactionResponse } from '@/lib/suilend';
import type { CetusToken } from '@/lib/suilend/core/tokens';
import { fetchCetusTokens } from '@/lib/suilend/core/tokens';
import { showToast } from '@/components/common/Toast';

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
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<StandardizedQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<StandardizedQuote | null>(null);
  const [swapData, setSwapData] = useState<ISwapTransactionResponse | null>(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [tokenInBalance, setTokenInBalance] = useState<string>('');
  const [tokenOutBalance, setTokenOutBalance] = useState<string>('');
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (walletInfo.address) {
      fetchHistory(); // Initial fetch

      // Auto refresh every 5 seconds
      const interval = setInterval(() => {
        fetchHistory();
      }, 5000);

      // Cleanup interval on unmount
      return () => clearInterval(interval);
    }
  }, [walletInfo.address]);

  async function fetchHistory() {
    try {
      setHistoryLoading(true);
      const { getTransactionHistory } = await import('@/lib/sui/history');
      const { SuiClient } = await import('@mysten/sui/client');
      const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
      const res = await getTransactionHistory(client, walletInfo.address, 5);
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function fetchTokenBalance(coinType: string): Promise<string> {
    try {
      const { SuiClient } = await import('@mysten/sui/client');
      const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });

      const balance = await client.getBalance({
        owner: walletInfo.address,
        coinType: coinType,
      });

      return balance.totalBalance;
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      return '0';
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
      const sui = tokens.find(t => t.symbol === 'SUI');
      const usdc = tokens.find(t => t.symbol === 'USDC');
      if (sui) setTokenIn(sui);
      if (usdc) setTokenOut(usdc);
    } catch (error) {
      console.error('Failed to load default tokens:', error);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountIn, tokenIn?.coinType, tokenOut?.coinType]);

  async function fetchQuotes() {
    if (!tokenIn || !tokenOut) return;

    setLoading(true);
    setError('');
    setQuotes([]);
    setSelectedQuote(null);
    setSwapData(null);

    try {
      const tokenInObj = createTokenObject(tokenIn.coinType);
      const tokenOutObj = createTokenObject(tokenOut.coinType);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);

      const allQuotes = await getSwapQuotes(
        tokenInObj,
        tokenOutObj,
        amount.toString()
      );

      setQuotes(allQuotes);

      if (allQuotes.length > 0) {
        setSelectedQuote(allQuotes[0]);
      } else {
        const msg = 'No routes available for this pair. Try a different amount or token pair.';
        setError(msg);
        showToast({
          type: 'error',
          title: 'No Routes Found',
          message: msg,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get quotes';
      // Don't show timeout errors to user
      if (!errorMsg.includes('timeout') && !errorMsg.includes('1500ms')) {
        setError(errorMsg);
        showToast({
          type: 'error',
          title: 'Quote Error',
          message: errorMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectQuote(quote: StandardizedQuote) {
    // Just select the quote, don't build transaction yet
    setSelectedQuote(quote);
  }

  async function handleBuildTransaction() {
    if (!selectedQuote || !tokenIn || !tokenOut) return;

    setLoading(true);
    setError('');

    try {
      const currentNetwork = typeof window !== 'undefined'
        ? localStorage.getItem('sui-network') || 'mainnet'
        : 'mainnet';

      if (currentNetwork !== 'mainnet') {
        const msg = 'Swap is only available on Mainnet. Please switch network first.';
        setError(msg);
        showToast({
          type: 'error',
          title: 'Wrong Network',
          message: msg,
        });
        setLoading(false);
        return;
      }

      const tokenInObj = createTokenObject(tokenIn.coinType);
      const tokenOutObj = createTokenObject(tokenOut.coinType);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);
      const slippagePercent = slippage;

      // Fetch user's balance for the input token
      const { SuiClient } = await import('@mysten/sui/client');
      const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });

      console.log('Checking balance for:', tokenIn.coinType);

      const balance = await client.getBalance({
        owner: walletInfo.address,
        coinType: tokenIn.coinType,
      });

      const balanceAmount = BigInt(balance.totalBalance);
      const requiredAmount = BigInt(Math.floor(amount));

      console.log('Balance:', balanceAmount.toString(), 'Required:', requiredAmount.toString());

      if (balanceAmount < requiredAmount) {
        const msg = `Insufficient ${tokenIn.symbol} balance. You have ${(Number(balanceAmount) / Math.pow(10, tokenIn.decimals)).toFixed(6)} ${tokenIn.symbol}`;
        setError(msg);
        showToast({
          type: 'error',
          title: 'Insufficient Balance',
          message: msg,
        });
        setLoading(false);
        return;
      }

      console.log('Building swap transaction with coin selection');

      // Build transaction with automatic coin selection from user's wallet
      const result = await buildSwapTransactionFromQuote(
        walletInfo.address,
        tokenInObj,
        tokenOutObj,
        amount.toString(),
        slippagePercent,
        selectedQuote,
        undefined  // Will trigger automatic coin selection
      );

      console.log('Transaction built successfully:', {
        estimatedAmountOut: result.estimatedAmountOut,
        quote: selectedQuote.provider
      });

      const minAmountOut = Math.floor(result.estimatedAmountOut * (1 - slippagePercent / 100));

      const routes = selectedQuote.routes.map(route => ({
        percent: route.percent.toNumber(),
        path: route.path.map(step => ({
          provider: step.provider,
          poolId: step.poolId,
          from: {
            coinType: step.in.coinType,
            amount: step.in.amount.toString(),
          },
          to: {
            coinType: step.out.coinType,
            amount: step.out.amount.toString(),
          },
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
          exchangeRate: result.estimatedAmountOut / (amount),
          routes,
        },
        slippage: {
          tolerance: slippagePercent,
          minAmountOut,
          minAmountOutFormatted: `${(minAmountOut / Math.pow(10, tokenOut.decimals)).toFixed(6)} ${tokenOut.symbol}`,
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to build transaction';
      setError(errorMsg);
      showToast({
        type: 'error',
        title: 'Transaction Error',
        message: errorMsg,
      });
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
    <div className="max-w-6xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6">
        {/* Left Column - Swap Interface */}
        <div className="space-y-6 max-w-[500px] mx-auto lg:mx-0">
          {/* Header with Toggle and Utility Icons */}
          <div className="flex items-center justify-between px-1">
            <SwapModeToggle activeMode="Instant" onModeChange={() => { }} />

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/10 text-[#00d084] rounded-full text-[12px] font-black border border-gray-100 dark:border-white/10 shadow-sm hover:bg-gray-50 transition-all">
                <div className="w-5 h-5 flex items-center justify-center bg-[#00d084]/10 rounded-full">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                Prime
                <svg className="w-3.5 h-3.5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M4 4h16m-8 8h8m-8 8h8" />
                </svg>
              </button>
              <button className="p-2 text-[#94a3b8] hover:text-[#111827] hover:bg-white rounded-xl shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </button>
              <button
                onClick={fetchQuotes}
                disabled={loading}
                className="p-2 text-[#94a3b8] hover:text-[#111827] hover:bg-white rounded-xl shadow-sm transition-all disabled:opacity-50"
              >
                <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
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
                  <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </button>
              </div>

              {/* Token Input - Buy */}
              <TokenInput
                label="Buy"
                token={tokenOut}
                amount={selectedQuote && tokenOut ? (extractRawAmountOut(selectedQuote) / Math.pow(10, tokenOut.decimals)).toFixed(6) : ''}
                onAmountChange={() => { }}
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
                  <span>1 {tokenIn.symbol} ≈ {(extractRawAmountOut(selectedQuote) / Math.pow(10, tokenOut.decimals) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}</span>
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
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
                className="w-full py-6 bg-[#00d084] hover:bg-[#00c07a] text-white text-[22px] font-black rounded-full shadow-xl shadow-[#00d084]/20 transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 tracking-tight uppercase"
              >
                {loading ? (
                  <svg className="animate-spin h-7 w-7 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
                  setAmountIn('');
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
                className="w-full py-6 bg-gray-100 text-[#94a3b8] text-[20px] font-black rounded-full disabled:opacity-50 uppercase tracking-tight"
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
                    <svg className="w-6 h-6 text-[#00d084] rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 p-2 px-3 bg-gradient-to-r from-[#00d084] to-[#00a569] text-white rounded-full shadow-md">
                        <span className="text-[12px] font-black">{quotes.length}</span>
                        <span className="text-[10px]">•</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span className="text-[11px] font-bold text-white/90 uppercase tracking-tight">Best Routes</span>
                      </div>
                    </div>
                  </div>
                </div>

                <DexQuoteList
                  quotes={quotes}
                  tokenOut={tokenOut}
                  selectedQuote={selectedQuote}
                  onSelectQuote={handleSelectQuote}
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
                    <svg className="w-5 h-5 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-[15px] font-black text-[#111827] dark:text-white">Swap History</span>
                  </div>
                  <button
                    onClick={fetchHistory}
                    disabled={historyLoading}
                    className="flex items-center gap-1.5 text-[12px] font-bold text-[#94a3b8] hover:text-[#00d084] transition-colors disabled:opacity-50"
                  >
                    <svg
                      className={`w-3.5 h-3.5 ${historyLoading ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {historyLoading ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>

                <div className="space-y-2">
                  {history.map((tx, idx) => (
                    <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-2xl border-2 border-gray-50 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                          <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-[14px] font-black text-[#111827] dark:text-white">Swap Transaction</div>
                          <div className="text-[12px] font-bold text-[#94a3b8]">{new Date(Number(tx.timestampMs)).toLocaleDateString()}</div>
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
