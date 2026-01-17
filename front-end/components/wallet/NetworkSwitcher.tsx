"use client";

import { useNetwork } from "@/lib/context/NetworkContext";
import { getCachedWalletInfo } from "@/lib/sui/passkey";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";

export default function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const walletInfo = getCachedWalletInfo();
    if (walletInfo) {
      setWalletAddress(walletInfo.address);
    }
  }, []);

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
    <div className="space-y-4">
      <label className="text-base font-semibold text-gray-400 uppercase tracking-wider mb-2 block">
        Sui Network
      </label>

      {/* Wallet Address */}
      {walletAddress && (
        <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Address
            </p>
            <p className="text-sm font-mono font-medium text-gray-900 truncate">
              {formatAddress(walletAddress)}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-all active:scale-95"
            title="Copy address"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {networks.map((net) => (
          <button
            key={net.value}
            onClick={() => setNetwork(net.value)}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl font-semibold transition-all border ${
              network === net.value
                ? "bg-primary/5 border-primary/20 text-primary shadow-xs"
                : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`w-2 h-2 rounded-full ${net.color} ${
                  network === net.value ? "animate-pulse" : ""
                }`}
              ></span>
              <span className="text-sm">{net.label}</span>
            </div>
            {network === net.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
          </button>
        ))}
      </div>
    </div>
  );
}
