"use client";

import { LendingModal } from "./LendingModal";
import { LendingPool, LendingModalConfig } from "@/features/lending";
import type { FormattedCoinBalance } from "@/integrations/sui/balance";
import { buildSupplyTransaction } from "@/integrations/lending/scallop";

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: LendingPool;
  walletAddress: string;
  walletCoins: FormattedCoinBalance[];
  onSuccess: () => void;
}

export function SupplyModal({
  isOpen,
  onClose,
  pool,
  walletAddress,
  walletCoins,
  onSuccess,
}: SupplyModalProps) {
  const coinBalance = walletCoins.find((c) => c.symbol.toUpperCase() === pool.coin.toUpperCase());
  const maxBalance = coinBalance ? parseFloat(coinBalance.balanceFormatted) : 0;

  const config: LendingModalConfig = {
    type: "supply",
    title: "Supply",
    actionLabel: "Supply",
    successMessage: "You have supplied {amount} {coin}",
    maxAmount: maxBalance,
    maxAmountLabel: "Balance",
    buildTransaction: async (params) => {
      return buildSupplyTransaction({
        ...params,
        decimals: pool.decimals,
      });
    },
  };

  return (
    <LendingModal
      isOpen={isOpen}
      onClose={onClose}
      pool={pool}
      walletAddress={walletAddress}
      onSuccess={onSuccess}
      config={config}
    />
  );
}
