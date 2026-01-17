'use client';

import type { StandardizedQuote } from '@suilend/sdk';
import { extractRawAmountOut } from '@/lib/suilend/core/quote';

interface DexQuoteListProps {
  quotes: StandardizedQuote[];
  tokenOut: {
    symbol: string;
    decimals: number;
  };
  selectedQuote: StandardizedQuote | null;
  onSelectQuote: (quote: StandardizedQuote) => void;
  loading: boolean;
}

const DEX_ICONS: Record<string, string> = {
  aftermath: '🌊',
  cetus: '🐋',
  flowx: '💧',
  turbos: '⚡',
  bluefin: '🐟',
};

const DEX_COLORS: Record<string, string> = {
  aftermath: 'from-blue-500 to-cyan-500',
  cetus: 'from-purple-500 to-pink-500',
  flowx: 'from-green-500 to-teal-500',
  turbos: 'from-yellow-500 to-orange-500',
  bluefin: 'from-indigo-500 to-blue-500',
};

export default function DexQuoteList({
  quotes,
  tokenOut,
  selectedQuote,
  onSelectQuote,
  loading,
}: DexQuoteListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Select Best Route
            </h3>
          </div>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
            {quotes.length} quotes
          </span>
        </div>
      </div>
      
      <div className="p-6">

        <div className="space-y-3">
          {quotes.map((quote, index) => {
            const rawAmount = extractRawAmountOut(quote);
            const amountOut = rawAmount / Math.pow(10, tokenOut.decimals);
            const isSelected = selectedQuote?.id === quote.id;
            const isBest = index === 0;
            const dexName = quote.provider.toLowerCase();
            const icon = DEX_ICONS[dexName] || '🔄';
            const gradient = DEX_COLORS[dexName] || 'from-gray-500 to-gray-600';

            return (
              <button
                key={quote.id}
                onClick={() => onSelectQuote(quote)}
                disabled={loading}
                className={`w-full p-5 rounded-2xl transition-all transform hover:scale-[1.01] disabled:scale-100 disabled:cursor-not-allowed border-2 ${
                  isSelected
                    ? 'bg-gradient-to-br ' + gradient + ' text-white shadow-xl border-transparent ring-4 ring-blue-100 dark:ring-blue-900'
                    : 'bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 hover:from-gray-100 hover:to-gray-50 dark:hover:from-gray-600 dark:hover:to-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-white/20' : 'bg-white dark:bg-gray-600 shadow-sm'}`}>
                      <span className="text-4xl">{icon}</span>
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xl font-bold uppercase ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                          {quote.provider}
                        </span>
                        {isBest && (
                          <span className="px-2.5 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            BEST
                          </span>
                        )}
                      </div>
                      <div className={`text-sm font-medium ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                        {quote.routes.length} {quote.routes.length === 1 ? 'route' : 'routes'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-2xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {amountOut.toFixed(6)}
                    </div>
                    <div className={`text-sm font-semibold ${isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                      {tokenOut.symbol}
                    </div>
                  </div>
                </div>

                {/* Route preview */}
                {quote.routes.length > 0 && (
                  <div className={`pt-3 border-t ${isSelected ? 'border-white/30' : 'border-gray-200 dark:border-gray-600'}`}>
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      {quote.routes[0].path.slice(0, 3).map((step, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <span className={`px-2 py-1 rounded-lg font-semibold ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200'}`}>
                            {step.provider}
                          </span>
                          {idx < Math.min(2, quote.routes[0].path.length - 1) && (
                            <svg className={`w-4 h-4 ${isSelected ? 'text-white/70' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          )}
                        </div>
                      ))}
                      {quote.routes[0].path.length > 3 && (
                        <span className={`px-2 py-1 rounded-lg text-xs ${isSelected ? 'bg-white/20 text-white/80' : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>
                          +{quote.routes[0].path.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-l-4 border-blue-500 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
                Smart Route Selection
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Best rate is pre-selected. Click any DEX to compare routes and choose your preferred path.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
