'use client';

import { useState, useEffect } from 'react';
import TokenInput from './TokenInput';
import DexQuoteList from './DexQuoteList';
import SwapButton from './SwapButton';
import { getSwapQuotes, extractRawAmountOut } from '@/lib/suilend/core/quote';
import { buildSwapTransactionFromQuote, createTokenObject } from '@/lib/suilend/core/transaction';
import type { StandardizedQuote } from '@suilend/sdk';
import type { ISwapTransactionResponse } from '@/lib/suilend';

interface SwapInterfaceProps {
  walletInfo: {
    address: string;
    email: string;
    privateKey?: string;
  };
}

const TOKENS = {
  SUI: {
    symbol: 'SUI',
    name: 'Sui',
    type: '0x2::sui::SUI',
    decimals: 9,
    icon: '⚡',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    type: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
    decimals: 6,
    icon: '💵',
  },
};

export default function SwapInterface({ walletInfo }: SwapInterfaceProps) {
  const [tokenIn, setTokenIn] = useState(TOKENS.SUI);
  const [tokenOut, setTokenOut] = useState(TOKENS.USDC);
  const [amountIn, setAmountIn] = useState('');
  const [slippage, setSlippage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<StandardizedQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<StandardizedQuote | null>(null);
  const [swapData, setSwapData] = useState<ISwapTransactionResponse | null>(null);
  const [error, setError] = useState('');

  // Auto fetch quotes when amount changes
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      const timer = setTimeout(() => {
        fetchQuotes();
      }, 500); // Debounce 500ms
      return () => clearTimeout(timer);
    } else {
      setQuotes([]);
      setSelectedQuote(null);
      setSwapData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountIn, tokenIn.type, tokenOut.type]);

  async function fetchQuotes() {
    setLoading(true);
    setError('');
    setQuotes([]);
    setSelectedQuote(null);
    setSwapData(null);

    try {
      const tokenInObj = createTokenObject(tokenIn.type);
      const tokenOutObj = createTokenObject(tokenOut.type);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);

      const allQuotes = await getSwapQuotes(
        tokenInObj,
        tokenOutObj,
        amount.toString()
      );

      setQuotes(allQuotes);
      
      // Auto-select best quote (first one)
      if (allQuotes.length > 0) {
        setSelectedQuote(allQuotes[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quotes');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectQuote(quote: StandardizedQuote) {
    // Just select the quote, don't build transaction yet
    setSelectedQuote(quote);
  }

  async function handleBuildTransaction() {
    if (!selectedQuote) return;

    setLoading(true);
    setError('');

    try {
      // Check current network
      const currentNetwork = typeof window !== 'undefined' 
        ? localStorage.getItem('sui-network') || 'mainnet'
        : 'mainnet';

      if (currentNetwork !== 'mainnet') {
        setError('Swap is only available on Mainnet. Please switch network first.');
        setLoading(false);
        return;
      }

      const tokenInObj = createTokenObject(tokenIn.type);
      const tokenOutObj = createTokenObject(tokenOut.type);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);
      const slippagePercent = slippage;

      // Fetch user's balance for the input token
      const { SuiClient } = await import('@mysten/sui/client');
      const client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
      
      console.log('Checking balance for:', tokenIn.type);
      
      const balance = await client.getBalance({
        owner: walletInfo.address,
        coinType: tokenIn.type,
      });

      const balanceAmount = BigInt(balance.totalBalance);
      const requiredAmount = BigInt(Math.floor(amount));

      console.log('Balance:', balanceAmount.toString(), 'Required:', requiredAmount.toString());

      if (balanceAmount < requiredAmount) {
        setError(`Insufficient ${tokenIn.symbol} balance. You have ${(Number(balanceAmount) / Math.pow(10, tokenIn.decimals)).toFixed(6)} ${tokenIn.symbol}`);
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
        // Save params to rebuild transaction before execution
        rebuildParams: {
          userAddress: walletInfo.address,
          tokenInType: tokenIn.type,
          tokenOutType: tokenOut.type,
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
      setError(err instanceof Error ? err.message : 'Failed to build transaction');
    } finally {
      setLoading(false);
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
    <div className="space-y-4">
      {/* Swap Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 space-y-1">
          {/* Token Input */}
          <TokenInput
            label="You pay"
            token={tokenIn}
            amount={amountIn}
            onAmountChange={setAmountIn}
            disabled={loading}
          />

          {/* Flip Button */}
          <div className="flex justify-center -my-3 relative z-10">
            <button
              onClick={handleFlipTokens}
              disabled={loading}
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-full p-3 shadow-lg transition-all transform hover:scale-110 hover:rotate-180 disabled:scale-100 disabled:rotate-0 duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
          </div>

          {/* Token Output */}
          <TokenInput
            label="You receive (estimated)"
            token={tokenOut}
            amount={selectedQuote ? (extractRawAmountOut(selectedQuote) / Math.pow(10, tokenOut.decimals)).toFixed(6) : ''}
            onAmountChange={() => {}}
            disabled={true}
            readOnly={true}
          />
        </div>

        {/* Slippage Settings */}
        <div className="px-6 pb-6">
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Slippage Tolerance
                </span>
              </div>
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-bold rounded-full">
                {slippage}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded-full appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>0.1% (Low)</span>
              <span>5% (High)</span>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-6 pb-6">
            <div className="flex items-center justify-center py-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-700">
              <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Finding best rates...</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Comparing 3 DEX aggregators</p>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-6 pb-6">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-xl">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DEX Quote List */}
      {quotes.length > 0 && !swapData && (
        <>
          <DexQuoteList
            quotes={quotes}
            tokenOut={tokenOut}
            selectedQuote={selectedQuote}
            onSelectQuote={handleSelectQuote}
            loading={loading}
          />
          
          {/* Continue Button */}
          {selectedQuote && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6">
              <button
                onClick={handleBuildTransaction}
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Building Transaction...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    Continue with {selectedQuote.provider.toUpperCase()}
                  </span>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Swap Button */}
      {swapData && (
        <SwapButton
          swapData={swapData}
          walletInfo={walletInfo}
          onSuccess={() => {
            setSwapData(null);
            setSelectedQuote(null);
            setAmountIn('');
          }}
          onBack={() => {
            setSwapData(null);
            setSelectedQuote(null);
          }}
        />
      )}
    </div>
  );
}
