'use client';

import { LendingModal } from './LendingModal';
import { LendingPool, LendingModalConfig } from '@/features/lending/types/lending.types';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: LendingPool;
  walletAddress: string;
  suppliedAmount: number;
  onSuccess: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  pool,
  walletAddress,
  suppliedAmount,
  onSuccess,
}: WithdrawModalProps) {
  const config: LendingModalConfig = {
    type: 'withdraw',
    title: 'Withdraw',
    actionLabel: 'Withdraw',
    successMessage: 'You have withdrawn {amount} {coin}',
    maxAmount: suppliedAmount,
    maxAmountLabel: 'Supplied',
    buildTransaction: async (params) => {
      const { buildWithdrawTransaction } = await import('@/integrations/lending/scallop/withdraw');
      return buildWithdrawTransaction({
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
