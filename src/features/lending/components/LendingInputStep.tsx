import { formatCurrency } from "@/shared/utils";
import { LendingPool, LendingModalConfig } from "@/features/lending";

interface LendingInputStepProps {
  amount: string;
  onAmountChange: (value: string) => void;
  onMaxClick: (max: number) => void;
  config: LendingModalConfig;
  pool: LendingPool;
  onContinue: () => void;
  estimatedYield: () => string | null;
}

export function LendingInputStep({
  amount,
  onAmountChange,
  onMaxClick,
  config,
  pool,
  onContinue,
  estimatedYield,
}: LendingInputStepProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 font-medium">Amount</span>
          <span className="text-gray-500">
            {config.maxAmountLabel}: {config.maxAmount.toFixed(3)} {pool.coin}
          </span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-4 pr-20 text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary transition-colors"
          />
          <button
            onClick={() => onMaxClick(config.maxAmount)}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-colors"
          >
            MAX
          </button>
        </div>
        {amount && (
          <p className="text-sm text-gray-500">
            ≈ {formatCurrency(parseFloat(amount) * pool.price)} USD
          </p>
        )}
      </div>

      <div className="space-y-3">
        {config.type === "supply" ? (
          <>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Supply APY</span>
              <span className="font-bold text-emerald-600">{pool.apy}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Est. Yearly Yield</span>
              <span className="font-bold text-gray-900">
                {estimatedYield()} {pool.coin}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Utilization Rate</span>
              <span className="font-bold text-gray-900">{pool.utilizationRate}%</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Current APY</span>
              <span className="font-bold text-emerald-600">{pool.apy}%</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Remaining After Withdraw</span>
              <span className="font-bold text-gray-900">
                {Math.max(0, config.maxAmount - (parseFloat(amount) || 0)).toFixed(3)} {pool.coin}
              </span>
            </div>
          </>
        )}
      </div>

      <button
        onClick={onContinue}
        disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > config.maxAmount}
        className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          config.type === "supply"
            ? "bg-linear-to-r from-primary to-[#00a569] hover:from-[#00c07a] hover:to-[#009557] text-white shadow-primary/20"
            : "bg-linear-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white"
        }`}
      >
        Continue
      </button>
    </>
  );
}
