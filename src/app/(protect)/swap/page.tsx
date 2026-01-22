"use client";

import { useEffect, useState } from "react";
import { SwapInterface } from "@/features/swap";
import { getCachedWalletInfo } from "@/integrations/sui/passkey";

export default function SwapPage() {
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      const cached = getCachedWalletInfo();
      if (cached) {
        setWalletInfo({ address: cached.address, email: cached.email });
        setLoading(false);
        return;
      }

      const stored = localStorage.getItem("sui_passkey_wallet");
      if (stored) {
        const { address, email } = JSON.parse(stored);
        setWalletInfo({ address, email });
      }
    } catch (error) {
      console.error("Failed to load wallet:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!walletInfo) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <p className="text-gray-600 mb-6">Please connect your wallet to use the swap feature</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return <SwapInterface walletInfo={walletInfo} />;
}
