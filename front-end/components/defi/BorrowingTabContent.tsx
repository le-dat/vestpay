import { useState } from "react";
import { SubTabConfig, TabContentProps, LendingPool, ScallopPool } from "@/lib/types/defi";
import { LendingPoolTable } from "./LendingPoolTable";
import { getCoinMetadata } from "@/lib/constants/defi-pools";

export const BorrowingTabContent = ({ searchQuery, marketData, loading }: TabContentProps) => {
  const [activeSubTab, setActiveSubTab] = useState("borrowing-pools");

  const subTabs: SubTabConfig[] = [
    { id: "borrowing-pools", label: "Borrowing Pools" } as any,
    { id: "collateral-pools", label: "Collateral Pools" } as any,
  ];

  // Map Scallop pools to LendingPool format for reuse
  const borrowPools: LendingPool[] =
    marketData?.pools.map((pool: ScallopPool) => {
      const metadata = getCoinMetadata(pool.symbol);
      return {
        coin: pool.symbol,
        icon: metadata.icon,
        badge: metadata.badge,
        price: pool.coinPrice,
        yourSupply: 0,
        totalSupply: pool.supplyCoin,
        totalBorrow: pool.borrowCoin,
        utilizationRate: Math.round(pool.utilizationRate * 100),
        apy: Number((pool.borrowApy * 100).toFixed(2)), // Use borrowApy here
      };
    }) || [];

  const filteredPools = borrowPools.filter((pool) =>
    pool.coin.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <div className="flex gap-6">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`pb-2 transition-colors cursor-pointer font-medium ${
                activeSubTab === tab.id
                  ? "text-gray-900 border-b-2 border-primary"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === "borrowing-pools" && (
        <LendingPoolTable pools={filteredPools} type="borrowing" />
      )}

      {activeSubTab === "collateral-pools" && (
        <div className="text-center py-12 text-gray-500">
          <p>Collateral Pools coming soon...</p>
        </div>
      )}
    </>
  );
};
