"use client";

import { ActivityTable, AssetList, BalanceCard, useCoinValues } from "@/features/dashboard";
import { DepositModal, NetworkSwitcher, SendModal, useWallet } from "@/features/wallet";
import { useScallopMarket } from "@/features/lending";
import { motion } from "framer-motion";
import { useState } from "react";

export default function DashboardPage() {
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const { data: marketData } = useScallopMarket();
  const { coins, loading } = useWallet();
  const coinValues = useCoinValues(coins, marketData || undefined);

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
            marketData={marketData || undefined}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-4 space-y-8"
        >
          <div className="bg-white border border-gray-200 p-8">
            <NetworkSwitcher />
          </div>
        </motion.div>
      </div>


      <div className="mt-8 grid grid-cols-[2fr_1fr] gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AssetList coins={coins} coinValues={coinValues} loading={loading} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ActivityTable />
        </motion.div>
      </div>

      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        onSuccess={() => setSendModalOpen(false)}
      />

      <DepositModal isOpen={depositModalOpen} onClose={() => setDepositModalOpen(false)} />
    </div>
  );
}
