import { ChevronDown } from "lucide-react";

interface TokenInputCardProps {
  type: "sell" | "buy";
  amount: string;
  token: string;
  tokenIcon: string;
  usdValue: string;
  balance: string;
  readOnly?: boolean;
  onAmountChange?: (value: string) => void;
  showTokenStack?: boolean;
}

export function TokenInputCard({
  type,
  amount,
  token,
  tokenIcon,
  usdValue,
  balance,
  readOnly = false,
  onAmountChange,
  showTokenStack = false,
}: TokenInputCardProps) {
  return (
    <div className="group p-5 bg-gray-50 dark:bg-gray-900/40 rounded-3xl border border-gray-200 dark:border-white/5 hover:border-primary/50 transition-all duration-300">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-500 text-sm font-medium uppercase tracking-wider">
          {type === "sell" ? "Sell" : "Buy"}
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <input
          type="text"
          value={amount}
          onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
          readOnly={readOnly}
          className="flex-1 bg-transparent text-4xl font-semibold outline-none text-gray-900 dark:text-white placeholder:text-gray-300 pointer-events-auto"
          placeholder="0"
        />
        <div className="flex items-center gap-3">
          {showTokenStack && (
            <div className="flex -space-x-2 mr-1">
              <img
                src="https://app.scallop.io/assets/sSUI-uzKhR9T7.png"
                alt="sSUI"
                className="w-6 h-6 rounded-full border border-gray-900 z-30"
              />
              <img
                src="https://app.scallop.io/assets/usdy-DAUJieJw.webp"
                alt="USDY"
                className="w-6 h-6 rounded-full border border-gray-900 z-20"
              />
              <img
                src="https://app.scallop.io/assets/weth-DEj6nE9Q.png"
                alt="WETH"
                className="w-6 h-6 rounded-full border border-gray-900 z-10"
              />
            </div>
          )}
          <button className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 pr-3 rounded-2xl border border-gray-200 dark:border-white/10 shadow-sm hover:border-primary transition-all">
            <img src={tokenIcon} alt={token} className="w-8 h-8 rounded-full" />
            <span className="font-bold text-lg">{token}</span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
      <div className="flex justify-between items-center mt-3">
        <span className="text-gray-400 text-sm">≈ ${usdValue}</span>
        <span className="text-gray-400 text-sm font-medium">Balance: {balance}</span>
      </div>
    </div>
  );
}
