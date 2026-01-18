'use client';

import type { StandardizedQuote } from '@suilend/sdk';
import { extractRawAmountOut } from '@/lib/suilend/core/quote';
import type { CetusToken } from '@/lib/suilend/core/tokens';

interface DexQuoteListProps {
  quotes: StandardizedQuote[];
  tokenOut: CetusToken | null;
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

export default function DexQuoteList({
  quotes,
  tokenOut,
  selectedQuote,
  onSelectQuote,
  loading,
}: DexQuoteListProps) {
  return (
    <div className="bg-[#94a3b8] dark:bg-white/10 rounded-[24px] p-2 space-y-1 shadow-sm">
      {quotes.map((quote, index) => {
        if (!tokenOut) return null;
        
        const rawAmount = extractRawAmountOut(quote);
        const amountOut = rawAmount / Math.pow(10, tokenOut.decimals);
        const isSelected = selectedQuote?.id === quote.id;
        const isBest = index === 0;
        const dexName = quote.provider.toLowerCase();

        return (
          <button
            key={quote.id}
            onClick={() => onSelectQuote(quote)}
            disabled={loading}
            className={`w-full flex items-center justify-between p-3 rounded-[20px] transition-all ${
              isSelected
                ? 'bg-black/10 shadow-inner'
                : 'hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-xl shadow-md border border-white/10">
                {DEX_ICONS[dexName] || '🔄'}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[15px] text-white uppercase tracking-tight">
                    {quote.provider}
                  </span>
                  {isBest && (
                    <span className="px-2 py-0.5 bg-[#00d084] text-[#111827] text-[9px] font-black rounded-lg uppercase">
                      Best Price
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-black text-[16px] text-white">
                ${amountOut.toFixed(2)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
