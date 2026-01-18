"use client";

import ActivityTable from "@/components/dashboard/ActivityTable";
import BalanceCard from "@/components/dashboard/BalanceCard";
import DepositModal from "@/components/wallet/DepositModal";
import NetworkSwitcher from "@/components/wallet/NetworkSwitcher";
import SendModal from "@/components/wallet/SendModal";
import { motion } from "framer-motion";
import { useState } from "react";

export default function DashboardPage() {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);

  return (
    <div className="pb-12">
      <div className="grid grid-cols-12 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 lg:col-span-8 space-y-10"
        >
          <BalanceCard
            onDeposit={() => setDepositModalOpen(true)}
            onSend={() => setSendModalOpen(true)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-4 space-y-8"
        >
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-xs">
            <NetworkSwitcher />
          </div>
        </motion.div>
      </div>
      <ActivityTable />

      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onSuccess={() => setSendModalOpen(false)}
      />

      <DepositModal isOpen={depositModalOpen} onClose={() => setDepositModalOpen(false)} />
    </div>
  );
}
