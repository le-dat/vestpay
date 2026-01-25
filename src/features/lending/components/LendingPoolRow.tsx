import { LendingPool } from "@/features/lending";
import { formatCurrency, formatNumber } from "@/shared/utils";
import Image from "next/image";

interface LendingPoolRowProps {
  pool: LendingPool;
  type: "lending" | "borrowing";
  onSupplyClick: (pool: LendingPool) => void;
  onWithdrawClick: (pool: LendingPool) => void;
}

export const LendingPoolRow = ({
  pool,
  type,
  onSupplyClick,
  onWithdrawClick,
}: LendingPoolRowProps) => {
  return (
    <tr key={pool.coin} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
      <td className="py-5 pl-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={pool.icon}
              alt={pool.coin}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full shadow-sm group-hover:scale-110 transition-transform"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-secondary tracking-tight">{pool.coin}</span>
              {pool.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded-full border border-primary/20 uppercase tracking-wider">
                  {pool.badge}
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-gray-400">
              ≈ {formatCurrency(pool.price)} USD
            </div>
          </div>
        </div>
      </td>
      <td className="py-5 text-right">
        <div className="text-secondary font-bold">
          {formatNumber(pool.yourSupply, 3)} {pool.coin}
        </div>
        <div className="text-xs font-semibold text-gray-400">
          ≈ {formatCurrency(pool.yourSupply)} USD
        </div>
      </td>
      <td className="py-5 text-right">
        <div className="text-secondary font-bold">
          {formatNumber(pool.totalSupply)} {pool.coin}
        </div>
        <div className="text-xs font-semibold text-emerald-600/80">
          ≈ {formatCurrency(pool.totalSupply * pool.price)} USD
        </div>
      </td>
      <td className="py-5 text-right">
        <div className="text-secondary font-bold">
          {formatNumber(pool.totalBorrow)} {pool.coin}
        </div>
        <div className="text-xs font-semibold text-gray-400">
          ≈ {formatCurrency(pool.totalBorrow * pool.price)} USD
        </div>
      </td>
      <td className="py-5 text-right">
        <div className="text-secondary font-bold tabular-nums">{pool.utilizationRate}%</div>
      </td>
      <td className="py-5 text-right">
        <div
          className={`font-bold tabular-nums ${
            pool.apy > 10 ? "text-amber-600" : "text-emerald-600"
          }`}
        >
          {pool.apy}%
        </div>
      </td>
      <td className="py-5 text-right pr-2">
        <div className="flex flex-col sm:flex-row gap-2 justify-end items-end sm:items-center">
          <button
            onClick={() => onSupplyClick(pool)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-bold border border-primary/20 cursor-pointer text-xs sm:text-sm shadow-sm hover:shadow-primary/20 active:scale-95 whitespace-nowrap"
          >
            {type === "lending" ? "Supply" : "Borrow"}
          </button>
          <button
            onClick={() => onWithdrawClick(pool)}
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 font-bold border border-gray-200 cursor-pointer text-xs sm:text-sm active:scale-95 whitespace-nowrap"
          >
            {type === "lending" ? "Withdraw" : "Repay"}
          </button>
        </div>
      </td>
    </tr>
  );
};
