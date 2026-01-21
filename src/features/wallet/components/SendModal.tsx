/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Modal from "@/shared/components/ui";
import { useNetwork } from "@/shared/contexts";
import { sendSui } from "@/integrations/sui/transactions";
import { getKeypairForSigning } from "@/integrations/sui/signing";
import { useWallet } from "@/features/wallet/hooks";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function SendModal({ isOpen, onClose, onSuccess }: SendModalProps) {
  const { client, network } = useNetwork();
  const { coins, refresh } = useWallet();
  const suiBalance = coins.find((c) => c.symbol === "SUI")?.balanceFormatted || "0";
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const LIST_AMOUNTS = ["25%", "50%", "100%"];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!recipient || !amount) {
      setError("Please fill in all fields");
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!recipient.startsWith("0x") || recipient.length !== 66) {
      setError("Invalid Sui address format");
      return;
    }

    setLoading(true);

    try {
      const wallet = await getKeypairForSigning();

      if (!wallet) {
        setError("Failed to access wallet. Please try again.");
        setLoading(false);
        return;
      }

      const result = await sendSui(client, wallet, recipient, amount);

      if (result.success) {
        setSuccess(`Transaction successful! Digest: ${result.digest?.slice(0, 10)}...`);
        setRecipient("");
        setAmount("");

        await refresh();

        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1500);
      } else {
        setError(result.error || "Transaction failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send transaction");
    } finally {
      setLoading(false);
    }
  };

  const handlePercentClick = (percent: string) => {
    const p = parseFloat(percent) / 100;
    const bal = parseFloat(suiBalance);
    if (!isNaN(bal)) {
      setAmount((bal * p).toFixed(9).replace(/\.?0+$/, ""));
    }
  };

  const handleClose = () => {
    setRecipient("");
    setAmount("");
    setError("");
    setSuccess("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Send SUI">
      <form onSubmit={handleSend} className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Amount (SUI)
            </label>
            <span className="text-xs font-medium text-gray-500">
              Balance:{" "}
              {parseFloat(suiBalance).toLocaleString(undefined, { maximumFractionDigits: 5 })} SUI
            </span>
          </div>
          <input
            type="number"
            step="0.000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            disabled={loading}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-semibold text-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="flex gap-2">
            {LIST_AMOUNTS.map((percent) => (
              <button
                key={percent}
                type="button"
                onClick={() => handlePercentClick(percent)}
                className="flex-1 py-2 text-xs font-semibold bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all text-gray-600 hover:text-primary active:scale-95"
              >
                {percent}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            disabled={loading}
            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-sm text-gray-900 focus:ring-4 focus:ring-primary/10 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
            <p className="text-sm text-green-600 font-medium">{success}</p>
          </div>
        )}

        {network !== "mainnet" && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
            <p className="text-xs font-semibold text-amber-600 text-center uppercase tracking-wider">
              {network} Network
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !!success}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold rounded-2xl py-4 px-6 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <ArrowUpRight className="w-5 h-5" />
              Send SUI
            </>
          )}
        </button>
      </form>
    </Modal>
  );
}
