import { useState } from "react";
import {
  SubTab,
  SubTabConfig,
  TabContentProps,
  LendingPool,
  ScallopPool,
} from "@/features/lending";
import { LendingPoolTable } from "./LendingPoolTable";
import { getCoinMetadata } from "@/config/defi-pools";
import type { FormattedCoinBalance } from "@/integrations/sui/balance";

interface LendingTabContentProps extends TabContentProps {
  walletAddress: string;
  walletCoins: FormattedCoinBalance[];
  onRefresh: () => void;
}

export const LendingTabContent = ({
  marketData,
  loading,
  walletAddress,
  walletCoins,
  onRefresh,
}: LendingTabContentProps) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("lending-pools");

  const subTabs: SubTabConfig[] = [{ id: "lending-pools", label: "Lending Pools" }];

  const scallopPools: LendingPool[] =
    marketData?.pools
      .map((pool: ScallopPool) => {
        const metadata = getCoinMetadata(pool.symbol);

        const sCoinBalance = walletCoins.find(
          (coin) => coin.coinType.toLowerCase() === pool.sCoinType.toLowerCase(),
        );

        const sSuiAmount = sCoinBalance ? parseFloat(sCoinBalance.balanceFormatted) : 0;

        const conversionRate = pool.conversionRate || 1;
        const yourSupply = sSuiAmount * conversionRate;

        return {
          coin: pool.symbol,
          icon: metadata.icon,
          badge: metadata.badge,
          price: pool.coinPrice,
          yourSupply,
          totalSupply: pool.supplyCoin,
          totalBorrow: pool.borrowCoin,
          utilizationRate: Math.round(pool.utilizationRate * 100),
          apy: Number((pool.supplyApy * 100).toFixed(2)),
          decimals: pool.coinDecimal,
        };
      })
      .sort((a, b) => {
        // Sort by yourSupply first (descending), then by APY (descending)
        if (a.yourSupply > 0 && b.yourSupply === 0) return -1;
        if (a.yourSupply === 0 && b.yourSupply > 0) return 1;
        return b.apy - a.apy;
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
        <LendingPoolTable
          pools={scallopPools}
          walletAddress={walletAddress}
          walletCoins={walletCoins}
          onRefresh={onRefresh}
          loading={loading}
        />
      )}
    </>
  );
};
