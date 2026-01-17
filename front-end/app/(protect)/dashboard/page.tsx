"use client";

import NetworkSwitcher from "@/components/wallet/NetworkSwitcher";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ActivityTable from "@/components/dashboard/ActivityTable";

export default function DashboardPage() {
  const handleDeposit = () => {
    // TODO: Open deposit modal
    console.log("Deposit clicked");
  };

  const handleSend = () => {
    // TODO: Open send modal
    console.log("Send clicked");
  };

  return (
    <div className="space-y-8">
      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Content (Balance & Activity) - 8 columns */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Balance Card with real data */}
          <BalanceCard onDeposit={handleDeposit} onSend={handleSend} />
        </div>

        {/* Right Content (Network Switcher & Extras) - 4 columns */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          {/* Network Switcher Card */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <NetworkSwitcher />
          </div>
        </div>
      </div>

      {/* Activity Card with real transaction data */}
      <ActivityTable />
    </div>
  );
}
