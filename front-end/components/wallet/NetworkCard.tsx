"use client";

import { useEffect, useState } from "react";
import { Copy, QrCode, RotateCcw } from "lucide-react";
import { getCachedWalletInfo } from "@/lib/sui/passkey";
import { useNetwork } from "@/lib/context/NetworkContext";

export function NetworkCard() {
  const { client } = useNetwork();
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [balance, setBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const info = getCachedWalletInfo();
    setWalletInfo(info);
    if (info?.address) {
      loadBalance(info.address);
    }
  }, []);

  const loadBalance = async (address: string) => {
    setLoading(true);
    try {
      const balance = await client.getBalance({
        owner: address,
      });
      const suiBalance = (Number(balance.totalBalance) / 1_000_000_000).toFixed(2);
      setBalance(suiBalance);
    } catch (error) {
      console.error("Failed to load balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (walletInfo?.address) {
      loadBalance(walletInfo.address);
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
    if (!addr) return "";
    return `${addr.slice(0, 10)}.....${addr.slice(-10)}`;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-[#111827]">Network</h3>
        <button
          onClick={handleRefresh}
          className={`p-2 rounded-full border border-gray-100 hover:bg-gray-50 transition-all group ${loading ? "animate-spin" : ""}`}
        >
          <RotateCcw className="w-5 h-5 text-[#00d084] group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[13px] font-semibold text-gray-400 uppercase tracking-wider">
              <th className="pb-6 font-medium">Network/Asset</th>
              <th className="pb-6 font-medium">Address</th>
              <th className="pb-6 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="group hover:bg-gray-50/50 transition-colors duration-200">
              <td className="py-2 align-middle">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#111827] flex items-center justify-center overflow-hidden shadow-inner">
                    <svg viewBox="0 0 100 100" className="w-7 h-7 fill-[#4CA2FF]">
                      <path d="M50 5C50 5 20 40 20 65C20 81.5 33.5 95 50 95C66.5 95 80 81.5 80 65C80 40 50 5 50 5Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="font-bold text-[#111827] text-base leading-tight uppercase">
                      SUI NETWORK
                    </h4>
                    <span className="text-sm text-gray-400 font-semibold mt-0.5">SUI</span>
                  </div>
                </div>
              </td>
              <td className="py-2 align-middle">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#111827] font-mono text-sm tracking-tight">
                    {formatAddress(walletInfo?.address)}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={copyAddress}
                      className="p-2.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] active:scale-95 transition-all"
                      title="Copy Address"
                    >
                      <Copy className="w-4 h-4 text-[#16A34A]" />
                    </button>
                    <button
                      className="p-2.5 rounded-xl bg-[#F0FDF4] hover:bg-[#DCFCE7] active:scale-95 transition-all"
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4 text-[#16A34A]" />
                    </button>
                  </div>
                </div>
              </td>
              <td className="py-2 align-middle text-right">
                <div className="flex flex-col items-end">
                  <h4 className="font-bold text-[#111827] text-lg leading-tight">{balance} SUI</h4>
                  <p className="text-sm text-gray-400 font-semibold mt-0.5 whitespace-nowrap">
                    ≈ $0.00 USD
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
