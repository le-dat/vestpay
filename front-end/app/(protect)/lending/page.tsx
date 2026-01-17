"use client";

import { LendingTabContent } from "@/components/defi/LendingTabContent";
import { useScallopMarket } from "@/lib/hooks/useScallopMarket";

const LendingPage = () => {
  const { data: marketData, loading } = useScallopMarket();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <LendingTabContent marketData={marketData || undefined} loading={loading} />
      </div>
    </div>
  );
};

export default LendingPage;
