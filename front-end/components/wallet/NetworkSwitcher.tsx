"use client";

import { useNetwork } from "@/lib/context/NetworkContext";
import { getCachedWalletInfo } from "@/lib/sui/passkey";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

export default function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  const [walletAddress] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return getCachedWalletInfo()?.address || "";
    }
    return "";
  });
  const [copied, setCopied] = useState(false);

  const networks = [
    // { value: "testnet", label: "Testnet", color: "bg-green-500" },
    // { value: "devnet", label: "Devnet", color: "bg-yellow-500" },
    { value: "mainnet", label: "Mainnet", color: "bg-red-500" },
  ] as const;

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopy = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-secondary uppercase tracking-widest">
          Sui Network
        </label>
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full border border-green-100">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-bold text-green-600 uppercase">Mainet</span>
        </div>
      </div>

      {walletAddress && (
        <div className="group relative overflow-hidden p-5 bg-secondary rounded-2xl transition-all hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Primary Account
              </p>
              <p className="text-base font-mono font-bold text-white tracking-tight">
                {formatAddress(walletAddress)}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95"
              title="Copy address"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {/* <div className="space-y-2">
        {networks.map((net) => (
          <button
            key={net.value}
            onClick={() => setNetwork(net.value)}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold transition-all border-2 ${
              network === net.value
                ? "bg-primary/5 border-primary/20 text-secondary"
                : "bg-white border-gray-50 text-gray-400 hover:border-gray-100 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2.5 h-2.5 rounded-full ${net.color} ${
                  network === net.value ? "ring-4 ring-red-500/20" : ""
                }`}
              />
              <span className="text-sm">{net.label}</span>
            </div>
            {network === net.value && (
              <div className="px-2 py-0.5 bg-primary rounded-md text-[9px] text-secondary font-black uppercase">
                Active
              </div>
            )}
          </button>
        ))}
      </div> */}
    </div>
  );
}
