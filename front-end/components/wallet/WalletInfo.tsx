"use client";

import { useState, useEffect } from "react";
import { getExplorerUrl } from "@/lib/sui/client";
import { getCachedWalletInfo } from "@/lib/sui/passkey";
import { useNetwork } from "@/lib/context/NetworkContext";

interface WalletInfoProps {
  refreshTrigger?: number;
}

export default function WalletInfo({ refreshTrigger }: WalletInfoProps) {
  const { client, network } = useNetwork();
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const info = getCachedWalletInfo();
    setWalletInfo(info);
  }, []);

  useEffect(() => {
    if (mounted && walletInfo?.address) {
      loadBalance();
    }
  }, [mounted, walletInfo?.address, network, refreshTrigger]); // Added refreshTrigger

  const loadBalance = async () => {
    if (!walletInfo?.address) return;

    setLoading(true);
    try {
      const balance = await client.getBalance({
        owner: walletInfo.address,
      });
      // Convert MIST to SUI with decimals (1 SUI = 1_000_000_000 MIST)
      const suiBalance = (Number(balance.totalBalance) / 1_000_000_000).toFixed(9);
      // Remove trailing zeros but keep at least 2 decimal places
      const formatted = parseFloat(suiBalance).toString();
      setBalance(formatted);
    } catch (error) {
      console.error("Failed to load balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    if (walletInfo?.address) {
      navigator.clipboard.writeText(walletInfo.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted || !walletInfo) {
    return (
      <div className="bg-white/5 border border-white/5 rounded-3xl p-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 bg-white/10 rounded-xl w-1/3"></div>
          <div className="h-32 bg-white/10 rounded-2xl"></div>
          <div className="h-20 bg-white/10 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm transition-all hover:bg-white/[0.07]">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between mb-10 relative z-10">
        <h2 className="text-2xl font-black text-foreground tracking-tight">Wallet Overview</h2>
        <button
          onClick={loadBalance}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/5 active:scale-95 group/refresh"
          title="Refresh balance"
        >
          <svg
            className={`w-5 h-5 text-secondary dark:text-gray-400 group-hover/refresh:rotate-180 transition-transform duration-500 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary to-emerald-600 rounded-3xl p-8 mb-8 shadow-[0_20px_40px_rgba(0,208,132,0.2)] group/balance">
        {/* Animated pattern overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,1)_1px,transparent_0)] bg-[length:24px_24px]" />

        <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mb-3 relative z-10">
          Available Balance
        </p>
        <div className="flex items-baseline relative z-10">
          {loading ? (
            <div className="h-12 w-48 bg-white/20 rounded-xl animate-pulse"></div>
          ) : (
            <>
              <span className="text-5xl font-black text-white tracking-tighter">{balance}</span>
              <span className="text-xl font-bold text-white/80 ml-3">SUI</span>
            </>
          )}
        </div>
      </div>

      {/* Address & Actions */}
      <div className="space-y-6 relative z-10">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">
            Wallet Address
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-5 py-4 bg-white/5 border border-white/5 rounded-2xl font-mono text-sm text-foreground break-all shadow-inner">
              {walletInfo.address}
            </div>
            <button
              onClick={copyAddress}
              className="p-4 bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all active:scale-95 shadow-lg shadow-primary/20 group/copy"
              title="Copy address"
            >
              {copied ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <a
          href={getExplorerUrl(walletInfo.address, network)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-white/10 text-foreground border border-white/5 font-black text-xs uppercase tracking-widest py-5 rounded-2xl transition-all group/explorer"
        >
          View on Explorer
          <svg
            className="w-4 h-4 group-hover/explorer:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </a>
      </div>

      {/* Security Info */}
      <div className="mt-8 p-5 bg-primary/5 rounded-2xl border border-primary/10">
        <p className="text-[10px] text-primary/80 font-bold leading-relaxed flex items-center gap-3">
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary animate-pulse" />
          Seedless security active via biometric Passkey.
        </p>
      </div>
    </div>
  );
}
