'use client';

import { useState, useEffect } from 'react';
import { useNetwork } from '@/lib/context/NetworkContext';
import { getCachedWalletInfo } from '@/lib/sui/passkey';
import {
  getFormattedCoinBalances,
  type FormattedCoinBalance,
} from '@/lib/sui/balance';

export interface WalletData {
  address: string;
  email: string;
  coins: FormattedCoinBalance[];
  loading: boolean;
  error: string | null;
}

export function useWallet() {
  const { client, network } = useNetwork();
  const [walletData, setWalletData] = useState<WalletData>({
    address: '',
    email: '',
    coins: [],
    loading: true,
    error: null,
  });

  const loadWalletData = async () => {
    try {
      setWalletData((prev) => ({ ...prev, loading: true, error: null }));

      const walletInfo = getCachedWalletInfo();
      if (!walletInfo) {
        throw new Error('No wallet found');
      }

      const coins = await getFormattedCoinBalances(client, walletInfo.address);

      setWalletData({
        address: walletInfo.address,
        email: walletInfo.email,
        coins,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Failed to load wallet data:', error);
      setWalletData((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load wallet data',
      }));
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [network]);

  const refresh = () => {
    loadWalletData();
  };

  return {
    ...walletData,
    refresh,
  };
}
