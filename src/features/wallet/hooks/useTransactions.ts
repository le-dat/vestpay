/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNetwork } from '@/shared/contexts';
import { getCachedWalletInfo } from '@/integrations/sui/passkey';
import {
  getTransactionHistory,
  formatTransactions,
  type TransactionSummary,
} from '@/integrations/sui/history';
import { showToast } from '@/shared/components/feedback';

export interface TransactionsData {
  transactions: TransactionSummary[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTransactions(limit: number = 20): TransactionsData {
  const { client, network } = useNetwork();
  const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const loadTransactions = useCallback(
    async (reset: boolean = true) => {
      try {
        setLoading(true);
        setError(null);

        const walletInfo = getCachedWalletInfo();
        if (!walletInfo) {
          throw new Error('No wallet found');
        }

        const result = await getTransactionHistory(
          client,
          walletInfo.address,
          limit,
          reset ? undefined : cursor || undefined
        );

        const formatted = formatTransactions(result.data, walletInfo.address);

        if (reset) {
          setTransactions(formatted);
        } else {
          setTransactions((prev) => [...prev, ...formatted]);
        }

        setCursor(result.nextCursor);
        setHasNextPage(result.hasNextPage);
      } catch (error: any) {
        console.error('Failed to load transactions:', error);
        const errorMsg = error.message || 'Failed to load transactions';
        setError(errorMsg);

        showToast({
          type: 'error',
          title: 'Transaction History Error',
          message: errorMsg,
        });
      } finally {
        setLoading(false);
      }
    },
    [client, network, limit, cursor]
  );

  useEffect(() => {
    loadTransactions(true);
  }, [network]);

  const loadMore = async () => {
    if (!loading && hasNextPage) {
      await loadTransactions(false);
    }
  };

  const refresh = async () => {
    setCursor(null);
    await loadTransactions(true);
  };

  return {
    transactions,
    loading,
    error,
    hasNextPage,
    loadMore,
    refresh,
  };
}
