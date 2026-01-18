import { useState } from "react";
import { SubTab, SubTabConfig, TabContentProps, LendingPool, ScallopPool } from "@/lib/types/defi";
import { LendingPoolTable } from "./LendingPoolTable";
import { getCoinMetadata } from "@/lib/constants/defi-pools";

export const LendingTabContent = ({ marketData, loading }: TabContentProps) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("lending-pools");

  const subTabs: SubTabConfig[] = [{ id: "lending-pools", label: "Lending Pools" }];

  const scallopPools: LendingPool[] =
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
        apy: Number((pool.supplyApy * 100).toFixed(2)),
      };
    }) || [];

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

      {activeSubTab === "lending-pools" && (
        <LendingPoolTable pools={scallopPools} loading={loading} />
      )}
    </>
  );
};
