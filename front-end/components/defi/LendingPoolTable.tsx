import { Info } from "lucide-react";
import { LendingPool } from "@/lib/types/defi";
import { formatCurrency, formatNumber } from "@/lib/utils/format";

interface LendingPoolTableProps {
  pools: LendingPool[];
  type?: "lending" | "borrowing";
}

export const LendingPoolTable = ({ pools, type = "lending" }: LendingPoolTableProps) => {
  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
            <th className="pb-4 font-medium">Coin</th>
            <th className="pb-4 font-medium text-right">
              {type === "lending" ? "Your Supply" : "Your Borrow"}
            </th>
            <th className="pb-4 font-medium text-right">Total Supply</th>
            <th className="pb-4 font-medium text-right">Total Borrow</th>
            <th className="pb-4 font-medium text-right">
              <div className="flex items-center justify-end gap-1">
                Utilization Rate
                <Info className="w-3 h-3" />
              </div>
            </th>
            <th className="pb-4 font-medium text-right">
              <div className="flex items-center justify-end gap-1">
                APY
                <Info className="w-3 h-3" />
              </div>
            </th>
            <th className="pb-4 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {pools.map((pool) => (
            <tr
              key={pool.coin}
              className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer"
            >
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary to-primary/80 flex items-center justify-center text-xl">
                    {pool.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{pool.coin}</span>
                      {pool.badge && (
                        <span className="px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded border border-purple-200">
                          {pool.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">≈ {formatCurrency(pool.price)} USD</div>
                  </div>
                </div>
              </td>
              <td className="py-4 text-right">
                <div className="text-gray-900 font-medium">
                  {pool.yourSupply} {pool.coin}
                </div>
                <div className="text-sm text-gray-500">≈ {formatCurrency(pool.yourSupply)} USD</div>
              </td>
              <td className="py-4 text-right">
                <div className="text-gray-900 font-medium">
                  {formatNumber(pool.totalSupply)} {pool.coin}
                </div>
                <div className="text-sm text-emerald-600">
                  ≈ {formatCurrency(pool.totalSupply * pool.price)} USD
                </div>
              </td>
              <td className="py-4 text-right">
                <div className="text-gray-900 font-medium">
                  {formatNumber(pool.totalBorrow)} {pool.coin}
                </div>
                <div className="text-sm text-gray-500">
                  ≈ {formatCurrency(pool.totalBorrow * pool.price)} USD
                </div>
              </td>
              <td className="py-4 text-right">
                <div className="text-gray-900 font-medium">{pool.utilizationRate}%</div>
              </td>
              <td className="py-4 text-right">
                <div
                  className={`font-semibold ${
                    pool.apy > 10 ? "text-amber-600" : "text-emerald-600"
                  }`}
                >
                  {pool.apy}%
                </div>
              </td>
              <td className="py-4 text-right">
                <div className="flex gap-2 justify-end">
                  <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-medium border border-primary/20 cursor-pointer">
                    {type === "lending" ? "Supply" : "Borrow"}
                  </button>
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium border border-gray-200 cursor-pointer">
                    {type === "lending" ? "Withdraw" : "Repay"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
