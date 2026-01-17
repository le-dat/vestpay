"use client";

import { useState } from "react";
import { requestFaucet } from "@/lib/sui/utils";
import { getCachedWalletInfo } from "@/lib/sui/passkey";
import { useNetwork } from "@/lib/context/NetworkContext";
import { Droplets, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface FaucetButtonProps {
  onSuccess?: () => void;
}

export default function FaucetButton({ onSuccess }: FaucetButtonProps) {
  const { network } = useNetwork();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const walletInfo = getCachedWalletInfo();

  const handleRequest = async () => {
    if (!walletInfo?.address) {
      setMessage("No wallet found");
      setIsError(true);
      return;
    }

    if (network !== "testnet") {
      setMessage("Faucet only available on Testnet");
      setIsError(true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const result = await requestFaucet(walletInfo.address);
      setMessage(result.message);
      setIsError(!result.success);

      if (result.success) {
        onSuccess?.();
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (error: any) {
      setMessage(error.message || "Failed to request faucet");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  if (network !== "testnet") {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <p className="text-xs text-gray-400 font-medium text-center">
          Faucet only available on Testnet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleRequest}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-white border border-primary/20 text-primary hover:bg-primary/5 font-bold py-3 px-6 rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Requesting...</span>
          </>
        ) : (
          <>
            <Droplets className="w-5 h-5 text-primary group-hover:animate-bounce" />
            <span>Get Testnet SUI</span>
          </>
        )}
      </button>

      {message && (
        <div
          className={`flex items-start gap-3 p-4 rounded-2xl border ${
            isError
              ? "bg-red-50 border-red-100 text-red-600"
              : "bg-primary/5 border-primary/10 text-primary"
          }`}
        >
          {isError ? (
            <XCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          )}
          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100/50">
        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
          Receive 1 SUI on Testnet instantly. Troubleshooting? Join the{" "}
          <a
            href="https://discord.gg/sui"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-bold"
          >
            Sui Discord
          </a>{" "}
          #testnet-faucet channel.
        </p>
      </div>
    </div>
  );
}
