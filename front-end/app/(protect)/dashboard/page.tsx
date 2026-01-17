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
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <BalanceCard onDeposit={handleDeposit} onSend={handleSend} />
        </div>
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <NetworkSwitcher />
          </div>
        </div>
      </div>
      <ActivityTable />
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
