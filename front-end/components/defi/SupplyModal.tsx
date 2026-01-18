'use client';

import { LendingModal } from './LendingModal';
import { LendingPool, LendingModalConfig } from '@/lib/types/defi';
import type { FormattedCoinBalance } from '@/lib/sui/balance';

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
  const coinBalance = walletCoins.find(
    (c) => c.symbol.toUpperCase() === pool.coin.toUpperCase()
  );
  const maxBalance = coinBalance ? parseFloat(coinBalance.balanceFormatted) : 0;

  const config: LendingModalConfig = {
    type: 'supply',
    title: 'Supply',
    actionLabel: 'Supply',
    successMessage: 'You have supplied {amount} {coin}',
    maxAmount: maxBalance,
    maxAmountLabel: 'Balance',
    buildTransaction: async (params) => {
      const { buildSupplyTransaction } = await import('@/lib/scallop/supply');
      return buildSupplyTransaction(params);
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
