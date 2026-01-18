import { useState } from 'react';
import type { CetusToken } from '@/lib/suilend/core/tokens';
import TokenSelector from './TokenSelector';

interface TokenInputProps {
  label: string;
  token: CetusToken | null;
  amount: string;
  onAmountChange: (value: string) => void;
  onTokenChange?: (token: CetusToken) => void;
  excludeToken?: CetusToken | null;
  disabled?: boolean;
  readOnly?: boolean;
}

function TokenIcon({ token, size = 'md' }: { token: CetusToken; size?: 'sm' | 'md' | 'lg' }) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  if (!token.logoURL || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#00d084] to-[#00c07a] flex items-center justify-center text-white font-black overflow-hidden`}>
        {token.symbol.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-white flex items-center justify-center`}>
      <img
        src={token.logoURL}
        alt={token.symbol}
        className="w-full h-full object-contain"
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
}: TokenInputProps) {
  const type = label.toLowerCase().includes('pay') || label.toLowerCase().includes('sell') ? 'sell' : 'buy';
  
  return (
    <div className={`p-8 bg-white dark:bg-[#111827] rounded-[32px] border transition-all duration-300 ${type === 'sell' ? 'border-[#00d084]/30 shadow-[0_0_20px_rgba(0,208,132,0.05)]' : 'border-gray-100 dark:border-white/10 shadow-sm'}`}>
      <div className="flex flex-col gap-2">
        {/* Top Row: Label */}
        <div className="flex justify-between items-center h-6">
          <span className="text-[#94a3b8] text-[14px] font-black uppercase tracking-[0.15em]">
            {type === 'sell' ? 'SELL' : 'BUY'}
          </span>
        </div>
        
        {/* Middle Row: Input & Selector */}
        <div className="flex items-center justify-between gap-4 py-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            className="flex-1 min-w-0 bg-transparent text-[52px] font-black outline-none text-[#111827] dark:text-white placeholder:text-gray-100 dark:placeholder:text-white/5 leading-tight"
            placeholder="0"
          />
          <div className="flex-shrink-0">
            {onTokenChange ? (
              <TokenSelector
                selectedToken={token}
                onSelect={onTokenChange}
                excludeToken={excludeToken}
              />
            ) : token ? (
              <div className="flex items-center gap-3 bg-white dark:bg-white/5 p-2 pr-5 pl-2.5 rounded-full border border-gray-100 dark:border-white/10 shadow-lg shadow-gray-200/50 dark:shadow-none">
                <TokenIcon token={token} size="md" />
                <span className="font-black text-[20px] text-[#111827] dark:text-white tracking-tight">{token.symbol}</span>
                <svg className="w-4 h-4 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="text-gray-400 font-bold">Select</div>
            )}
          </div>
        </div>

        {/* Bottom Row: USD & Balance */}
        <div className="flex justify-between items-center mt-3">
          <div className="text-[#94a3b8] text-[15px] font-bold">
            ≈ ${amount ? (parseFloat(amount) || 0).toFixed(2) : "1.00"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#94a3b8] text-[13px] font-bold">
              Balance: <span className="text-[#64748b] dark:text-[#94a3b8]">-</span>
            </span>
            {type === 'sell' && (
                <div className="flex items-center gap-1.5 ml-2">
                   <button className="text-[12px] font-black text-[#00d084] hover:opacity-80 transition-all">MAX</button>
                   <span className="text-[#94a3b8] text-xs">•</span>
                   <button className="text-[12px] font-black text-[#64748b] hover:text-[#00d084] transition-all">%</button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
