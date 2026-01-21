import { Info, RefreshCcw, TrendingUp } from "lucide-react";
import { ReactNode } from "react";

export interface Quote {
  name: string;
  price: string;
  badge?: string;
  icon: ReactNode;
}

interface QuotesSectionProps {
  quotes: Quote[];
  routeInfo?: {
    hopCount: number;
    protocols: string;
  };
}

export function QuotesSection({ quotes, routeInfo }: QuotesSectionProps) {
  return (
    <div className="mt-8 space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-gray-700 dark:text-white/80 font-bold">
          <TrendingUp className="w-5 h-5 text-primary" />
          Quotes
        </div>
        {routeInfo && (
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg">
            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
              <span className="px-1 bg-white dark:bg-gray-700 rounded text-gray-900 dark:text-white">
                {routeInfo.hopCount}
              </span>
              <RefreshCcw className="w-3 h-3" />
            </div>
            <span className="text-[10px] text-gray-500 uppercase tracking-tighter">
              via {routeInfo.protocols}
            </span>
            <Info className="w-4 h-4 text-gray-400 cursor-pointer" />
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden">
        {quotes.map((quote, idx) => (
          <div
            key={quote.name}
            className={`flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer ${
              idx !== quotes.length - 1 ? "border-b border-gray-200 dark:border-white/5" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                {quote.icon}
              </div>
              <span className="font-bold text-gray-900 dark:text-white">{quote.name}</span>
              {quote.badge && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black uppercase rounded-md tracking-wider">
                  {quote.badge}
                </span>
              )}
            </div>
            <span className="font-mono font-bold text-gray-900 dark:text-white">
              ${quote.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
