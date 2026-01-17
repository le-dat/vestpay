"use client";

import { useState } from "react";
import NetworkSwitcher from "@/components/wallet/NetworkSwitcher";
import BalanceCard from "@/components/dashboard/BalanceCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import SendModal from "@/components/wallet/SendModal";
import DepositModal from "@/components/wallet/DepositModal";

export default function DashboardPage() {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  const handleDeposit = () => {
    setDepositModalOpen(true);
  };

  const handleSend = () => {
    setSendModalOpen(true);
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

      {/* Modals */}
      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onSuccess={() => {
          setSendModalOpen(false);
        }}
      />

      <DepositModal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
      />
    </div>
  );
}
