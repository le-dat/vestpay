'use client';

import { useState, useEffect } from 'react';
import { useNetwork } from '@/shared/contexts';
import { getCachedWalletInfo } from '@/integrations/sui/passkey';
import {
  getFormattedCoinBalances,
  type FormattedCoinBalance,
} from '@/integrations/sui/balance';
import { showToast } from '@/shared/components/feedback';

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
      const errorMsg = error.message || 'Failed to load wallet data';
      setWalletData((prev) => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));

      showToast({
        type: 'error',
        title: 'Wallet Error',
        message: errorMsg,
      });
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
