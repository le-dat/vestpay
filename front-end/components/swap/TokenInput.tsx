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
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold`}>
        {token.symbol.charAt(0)}
      </div>
    );
  }

  return (
    <img
      src={token.logoURL}
      alt={token.symbol}
      className={`${sizeClasses[size]} rounded-full`}
      onError={() => setImageError(true)}
    />
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
  return (
    <div className="group">
      <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
        {label}
      </label>
      <div className="p-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200">
        <div className="flex items-center gap-4">
          {onTokenChange ? (
            <TokenSelector
              selectedToken={token}
              onSelect={onTokenChange}
              excludeToken={excludeToken}
            />
          ) : token ? (
            <div className="flex items-center gap-3 bg-white dark:bg-gray-600 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-500 min-w-[140px]">
              <TokenIcon token={token} size="md" />
              <div>
                <div className="font-bold text-lg text-gray-900 dark:text-white">{token.symbol}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{token.name}</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Select token</div>
          )}
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            disabled={disabled}
            readOnly={readOnly}
            placeholder="0.00"
            className="flex-1 text-3xl font-bold bg-transparent text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-gray-600 outline-none disabled:cursor-not-allowed text-right"
          />
        </div>
      </div>
    </div>
  );
}
