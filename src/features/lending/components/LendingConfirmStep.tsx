import { formatCurrency } from "@/shared/utils";
import { LendingPool, LendingModalConfig } from "@/features/lending";

interface LendingConfirmStepProps {
  amount: string;
  config: LendingModalConfig;
  pool: LendingPool;
  loading: boolean;
  onBack: () => void;
  onConfirm: () => void;
  estimatedYield: () => string | null;
}

export function LendingConfirmStep({
  amount,
  config,
  pool,
  loading,
  onBack,
  onConfirm,
  estimatedYield,
}: LendingConfirmStepProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">You&apos;re {config.type}ing</span>
            <span className="font-bold text-gray-900">
              {amount} {pool.coin}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Value</span>
            <span className="font-bold text-gray-900">
              ≈ {formatCurrency(parseFloat(amount) * pool.price)} USD
            </span>
          </div>
          {config.type === "supply" ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">APY</span>
                <span className="font-bold text-emerald-600">{pool.apy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Est. Yearly Yield</span>
                <span className="font-bold text-emerald-600">
                  {estimatedYield()} {pool.coin}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Remaining Supply</span>
              <span className="font-bold text-gray-900">
                {Math.max(0, config.maxAmount - parseFloat(amount)).toFixed(3)} {pool.coin}
              </span>
            </div>
          )}
        </div>

        <div
          className={`p-4 border rounded-xl ${
            config.type === "supply" ? "bg-amber-50 border-amber-200" : "bg-blue-50 border-blue-200"
          }`}
        >
          <p className={`text-sm ${config.type === "supply" ? "text-amber-800" : "text-blue-800"}`}>
            {config.type === "supply"
              ? `By supplying ${pool.coin}, you'll receive sCoin tokens representing your deposit. You can withdraw your assets anytime.`
              : `Your sCoin tokens will be burned and you'll receive ${pool.coin} back to your wallet.`}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`flex-1 py-4 font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
            config.type === "supply"
              ? "bg-linear-to-r from-primary to-[#00a569] hover:from-[#00c07a] hover:to-[#009557] text-white shadow-primary/20"
              : "bg-linear-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white"
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Confirming...
            </>
          ) : (
            `Confirm ${config.actionLabel}`
          )}
        </button>
      </div>
    </>
  );
}
