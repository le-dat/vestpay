interface TokenInputProps {
  label: string;
  token: {
    symbol: string;
    name: string;
    icon: string;
  };
  amount: string;
  onAmountChange: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export default function TokenInput({
  label,
  token,
  amount,
  onAmountChange,
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
          <div className="flex items-center gap-3 bg-white dark:bg-gray-600 px-4 py-3 rounded-xl shadow-sm border border-gray-200 dark:border-gray-500 min-w-[140px]">
            <span className="text-3xl">{token.icon}</span>
            <div>
              <div className="font-bold text-lg text-gray-900 dark:text-white">{token.symbol}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{token.name}</div>
            </div>
          </div>
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
