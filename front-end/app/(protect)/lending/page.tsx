"use client";

import { LendingTabContent } from "@/components/defi/LendingTabContent";
import { useScallopMarket } from "@/lib/hooks/useScallopMarket";
import { useWallet } from "@/lib/hooks/useWallet";
import { showToast } from "@/components/common/Toast";
import { useEffect } from "react";

const LendingPage = () => {
  const { data: marketData, loading, error: marketError, refresh: refreshMarket } = useScallopMarket();
  const { address, coins, refresh: refreshWallet } = useWallet();

  useEffect(() => {
    if (marketError) {
      showToast({
        type: 'error',
        title: 'Market Data Error',
        message: marketError.message || 'Failed to load market data',
      });
    }
  }, [marketError]);

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
