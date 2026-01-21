import { RefreshCcw } from "lucide-react";

interface ExchangeRateProps {
  fromToken: string;
  toToken: string;
  rate: string;
  onRefresh?: () => void;
}

export function ExchangeRate({ fromToken, toToken, rate, onRefresh }: ExchangeRateProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium px-1">
      <span>
        1 {fromToken} ≈ {rate} {toToken}
      </span>
      <button
        onClick={onRefresh}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/5"
      >
        <RefreshCcw className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
