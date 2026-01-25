"use client";

import { getCachedWalletInfo } from "@/integrations/sui/passkey";
import { Copy, Check } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function NetworkSwitcher() {
  const [walletAddress] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return getCachedWalletInfo()?.address || "";
    }
    return "";
  });
  const [copied, setCopied] = useState(false);

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
      <div className="flex items-center gap-3 mt-1">
        <div className="w-8 h-8 rounded-full bg-blue-50 p-1.5 flex items-center justify-center relative">
          <Image
            src="https://cryptologos.cc/logos/sui-sui-logo.png"
            alt="Sui"
            width={20}
            height={20}
            className="object-contain"
          />
        </div>
        <h2 className="text-2xl font-bold text-blue-800">Sui</h2>
      </div>

      {walletAddress && (
        <div className="group relative overflow-hidden p-5 bg-secondary rounded-2xl transition-all hover:shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary/20 transition-all duration-500" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
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
    </div>
  );
}
