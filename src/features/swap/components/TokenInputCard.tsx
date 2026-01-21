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
    <div className={`p-6 bg-white dark:bg-white/5 rounded-[28px] border-2 ${type === 'sell' ? 'border-[#00d084]/20' : 'border-gray-50 dark:border-white/5'} transition-all duration-300`}>
      <div className="flex justify-between items-center mb-4">
        <span className="text-[#64748b] text-[13px] font-bold uppercase tracking-[0.1em]">
          {type === "sell" ? "Sell" : "Buy"}
        </span>
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={amount}
            onChange={onAmountChange ? (e) => onAmountChange(e.target.value) : undefined}
            readOnly={readOnly}
            className="w-full bg-transparent text-[44px] font-black outline-none text-[#111827] dark:text-white placeholder:text-gray-200"
            placeholder="0"
          />
          <div className="text-[#94a3b8] text-[14px] font-semibold mt-1">
            ≈ ${usdValue || "0.00"}
          </div>
        </div>

        <div className="flex flex-col items-end gap-3 self-center">
          <button className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 pr-4 pl-3 rounded-full border border-gray-100 dark:border-white/10 hover:border-[#00d084]/50 transition-all shadow-sm group">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white">
              <img src={tokenIcon} alt={token} className="w-full h-full object-contain" />
            </div>
            <span className="font-black text-[18px] text-[#111827] dark:text-white">{token}</span>
            <ChevronDown className="w-5 h-5 text-[#94a3b8] group-hover:text-[#111827] transition-colors" />
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8] text-[13px] font-bold">
              Balance: <span className="text-[#64748b]">{balance || "0"}</span>
            </span>
            {type === "sell" && (
                <div className="flex items-center gap-1 ml-1">
                   <button className="text-[11px] font-black text-[#00d084] hover:opacity-80">MAX</button>
                   <span className="text-[#94a3b8] text-[11px] font-bold">•</span>
                   <button className="text-[11px] font-black text-[#64748b] hover:text-[#00d084] transition-colors">%</button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
