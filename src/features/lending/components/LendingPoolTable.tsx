/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import type { FormattedCoinBalance } from "@/integrations/sui/balance";
import { LendingPool } from "@/features/lending";
import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { SupplyModal } from "./SupplyModal";
import { WithdrawModal } from "./WithdrawModal";
import { LendingPoolRow } from "./LendingPoolRow";

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
                  <LendingPoolRow
                    key={pool.coin}
                    pool={pool}
                    type={type}
                    onSupplyClick={handleSupplyClick}
                    onWithdrawClick={handleWithdrawClick}
                  />
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
