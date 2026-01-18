"use client";

import { LendingTabContent } from "@/components/defi/LendingTabContent";
import { useScallopMarket } from "@/lib/hooks/useScallopMarket";
import { useWallet } from "@/lib/hooks/useWallet";

const LendingPage = () => {
  const { data: marketData, loading, refresh: refreshMarket } = useScallopMarket();
  const { address, coins, refresh: refreshWallet } = useWallet();

  const handleRefresh = () => {
    refreshMarket();
    refreshWallet();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <LendingTabContent
          marketData={marketData || undefined}
          loading={loading}
          walletAddress={address}
          walletCoins={coins}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
};

export default LendingPage;
