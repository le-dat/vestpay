'use client';

import type { FormattedCoinBalance } from '@/lib/sui/balance';
import { LendingPool } from "@/lib/types/defi";
import { formatCurrency, formatNumber } from "@/lib/utils/format";
import { Info } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from 'react';
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SupplyModal } from "./SupplyModal";
import { WithdrawModal } from "./WithdrawModal";

interface LendingPoolTableProps {
  pools: LendingPool[];
  type?: "lending" | "borrowing";
  loading?: boolean;
  walletAddress: string;
  walletCoins: FormattedCoinBalance[];
  onRefresh: () => void;
}

const VISIBLE_COUNT = 10;

export const LendingPoolTable = ({
  pools,
  type = "lending",
  loading = false,
  walletAddress,
  walletCoins,
  onRefresh,

}: LendingPoolTableProps) => {
  const [visibleCount, setVisibleCount] = useState(VISIBLE_COUNT);
  const loadMoreRef = useRef<HTMLTableRowElement>(null);

  const [supplyModalOpen, setSupplyModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedPool, setSelectedPool] = useState<LendingPool | null>(null);

  const handleSupplyClick = (pool: LendingPool) => {
    setSelectedPool(pool);
    setSupplyModalOpen(true);
  };

  const handleWithdrawClick = (pool: LendingPool) => {
    setSelectedPool(pool);
    setWithdrawModalOpen(true);
  };

  const handleModalSuccess = () => {
    onRefresh();
  };

  useEffect(() => {
    setVisibleCount(VISIBLE_COUNT);
  }, [pools.length]);

  useEffect(() => {
    if (loading || visibleCount >= pools.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 10, pools.length));
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loading, visibleCount, pools.length]);

  const visiblePools = pools.slice(0, visibleCount);
  return (
    <>
      <div
        className={`overflow-x-auto custom-scrollbar ${loading ? "max-h-[600px] overflow-y-auto" : ""}`}
      >
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500 border-b border-gray-100 italic">
              <th className="pb-4 font-medium pl-2">Coin</th>
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
              <th className="pb-4 font-medium pr-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <LoadingSkeleton type={type} />
            ) : pools.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-gray-500 italic">
                  No pools available
                </td>
              </tr>
            ) : (
              <>
                {visiblePools.map((pool) => (
                  <tr
                    key={pool.coin}
                    className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
                  >
                    {/* ... existing row content ... */}
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
                            <span className="font-bold text-secondary tracking-tight">
                              {pool.coin}
                            </span>
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
                        {pool.yourSupply} {pool.coin}
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
                      <div className="text-secondary font-bold tabular-nums">
                        {pool.utilizationRate}%
                      </div>
                    </td>
                    <td className="py-5 text-right">
                      <div
                        className={`font-bold tabular-nums ${pool.apy > 10 ? "text-amber-600" : "text-emerald-600"
                          }`}
                      >
                        {pool.apy}%
                      </div>
                    </td>
                    <td className="py-5 text-right pr-2">
                      <div className="flex flex-col sm:flex-row gap-2 justify-end items-end sm:items-center">
                        <button
                          onClick={() => handleSupplyClick(pool)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all duration-300 font-bold border border-primary/20 cursor-pointer text-xs sm:text-sm shadow-sm hover:shadow-primary/20 active:scale-95 whitespace-nowrap"
                        >
                          {type === "lending" ? "Supply" : "Borrow"}
                        </button>
                        <button
                          onClick={() => handleWithdrawClick(pool)}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all duration-300 font-bold border border-gray-200 cursor-pointer text-xs sm:text-sm active:scale-95 whitespace-nowrap"
                        >
                          {type === "lending" ? "Withdraw" : "Repay"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleCount < pools.length && (
                  <tr ref={loadMoreRef}>
                    <td colSpan={7} className="py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce" />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        />
                        <div
                          className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-bounce"
                          style={{ animationDelay: "0.4s" }}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            )}
          </tbody>
        </table>
      </div>
      {/* Supply Modal */}
      {selectedPool && (
        <SupplyModal
          isOpen={supplyModalOpen}
          onClose={() => setSupplyModalOpen(false)}
          pool={selectedPool}
          walletAddress={walletAddress}
          walletCoins={walletCoins}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Withdraw Modal */}
      {selectedPool && (
        <WithdrawModal
          isOpen={withdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          pool={selectedPool}
          walletAddress={walletAddress}
          suppliedAmount={selectedPool.yourSupply}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
};
