import { useState } from "react";
import type { CetusToken } from "@/lib/suilend/core/tokens";
import TokenSelector from "./TokenSelector";
import { motion } from "framer-motion";

interface TokenInputProps {
  label: string;
  token: CetusToken | null;
  amount: string;
  onAmountChange: (value: string) => void;
  onTokenChange?: (token: CetusToken) => void;
  excludeToken?: CetusToken | null;
  disabled?: boolean;
  readOnly?: boolean;
  balance?: string;
  onMaxClick?: () => void;
}

function TokenIcon({ token, size = "md" }: { token: CetusToken; size?: "sm" | "md" | "lg" }) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  if (!token.logoURL || imageError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#00d084] to-[#00c07a] flex items-center justify-center text-white font-black overflow-hidden shadow-sm`}
      >
        {token.symbol.charAt(0)}
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5 shadow-sm border border-gray-100 dark:border-white/10`}
    >
      <img
        src={token.logoURL}
        alt={token.symbol}
        className="w-full h-full object-contain rounded-full"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export default function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
  onTokenChange,
  excludeToken,
  disabled = false,
  readOnly = false,
  balance,
  onMaxClick,
}: TokenInputProps) {
  const type =
    label.toLowerCase().includes("pay") || label.toLowerCase().includes("sell") ? "sell" : "buy";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 bg-white dark:bg-white/5 rounded-[28px] border transition-all duration-500 group ${
        type === "sell"
          ? "border-[#00d084]/20 focus-within:border-[#00d084]/50 shadow-[0_8px_30px_rgb(0,208,132,0.04)] focus-within:shadow-[0_8px_40px_rgb(0,208,132,0.08)]"
          : "border-gray-100 dark:border-white/10 focus-within:border-gray-200 dark:focus-within:border-white/20 shadow-sm"
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-[#94a3b8] text-[11px] font-black uppercase tracking-[0.2em]">
            {type === "sell" ? "You Sell" : "You Receive"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8] text-[11px] font-bold">
              Balance:{" "}
              <span className="text-[#111827] dark:text-gray-200 font-black">
                {balance || "0.00"}
              </span>
            </span>
            {type === "sell" && onMaxClick && (
              <button
                onClick={onMaxClick}
                className="text-[10px] px-2 py-0.5 bg-[#00d084]/10 text-[#00d084] rounded-md font-black hover:bg-[#00d084]/20 transition-all uppercase tracking-wider"
              >
                Max
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || parseFloat(value) >= 0) {
                onAmountChange(value);
              }
            }}
            onWheel={(e) => e.currentTarget.blur()}
            disabled={disabled}
            readOnly={readOnly}
            min="0"
            step="any"
            className="flex-1 min-w-0 bg-transparent text-[36px] font-black outline-none text-[#111827] dark:text-white placeholder:text-gray-200 dark:placeholder:text-white/10 leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none transition-all"
            placeholder="0.00"
          />
          <div className="flex-shrink-0">
            {onTokenChange ? (
              <TokenSelector
                selectedToken={token}
                onSelect={onTokenChange}
                excludeToken={excludeToken}
              />
            ) : token ? (
              <div className="flex items-center gap-2.5 bg-gray-50 dark:bg-white/5 p-1.5 pr-4 pl-1.5 rounded-full border border-gray-100 dark:border-white/10 shadow-sm">
                <TokenIcon token={token} size="md" />
                <span className="font-black text-[18px] text-[#111827] dark:text-white tracking-tight">
                  {token.symbol}
                </span>
                <svg
                  className="w-3.5 h-3.5 text-[#94a3b8]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="3"
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="px-4 py-2 bg-[#00d084] text-white rounded-full font-black text-sm shadow-lg shadow-[#00d084]/20">
                Select Token
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row: USD Value */}
        <div className="flex justify-between items-center h-5">
          <div className="text-[#94a3b8] text-[13px] font-bold">
            {amount ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                ≈ $
                {(parseFloat(amount) * 1.0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </motion.span>
            ) : (
              <span className="opacity-0">≈ $0.00</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
