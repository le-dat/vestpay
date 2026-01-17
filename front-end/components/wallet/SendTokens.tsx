"use client";

import { useState } from "react";
import { useNetwork } from "@/lib/context/NetworkContext";
import { sendSui } from "@/lib/sui/transactions";
import { getKeypairForSigning } from "@/lib/sui/signing";

interface SendTokensProps {
  onSuccess?: () => void;
}

export default function SendTokens({ onSuccess }: SendTokensProps) {
  const { client, network } = useNetwork();
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
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
      // Get keypair (checks cache first, recovers if needed)
      const wallet = await getKeypairForSigning();

      if (!wallet) {
        setError("Failed to access wallet. Please try again.");
        setLoading(false);
        return;
      }

      // Send transaction
      const result = await sendSui(client, wallet, recipient, amount);

      if (result.success) {
        setSuccess(`Transaction successful! Digest: ${result.digest?.slice(0, 10)}...`);
        setRecipient("");
        setAmount("");
        onSuccess?.();
      } else {
        setError(result.error || "Transaction failed");
      }
    } catch (err: any) {
      setError(err.message || "Failed to send transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className="text-6xl">🚀</span>
      </div>

      <h3 className="text-2xl font-black text-foreground mb-8">Send SUI</h3>

      <form onSubmit={handleSend} className="space-y-6">
        <div className="space-y-3">
          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl font-mono text-sm text-foreground focus:ring-4 focus:ring-primary/10 transition-all outline-none"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-1">
            Amount (SUI)
          </label>
          <input
            type="number"
            step="0.000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full px-5 py-4 bg-white/5 border border-white/5 rounded-2xl text-lg font-black text-foreground focus:ring-4 focus:ring-primary/10 transition-all outline-none placeholder:text-gray-600"
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-5">
            <p className="text-xs text-red-500 font-black uppercase tracking-widest">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5">
            <p className="text-xs text-primary font-black uppercase tracking-widest">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] py-5 rounded-2xl transition-all shadow-[0_10px_30px_rgba(0,208,132,0.2)] active:scale-95 disabled:grayscale disabled:opacity-50"
        >
          {loading ? "Processing..." : "Execute Transaction"}
        </button>
      </form>

      {network !== "mainnet" && (
        <div className="mt-8 pt-6 border-t border-white/5">
          <p className="text-[10px] text-secondary font-bold text-center">
            💡 Network: <span className="text-primary uppercase">{network}</span> — Simulation Mode
          </p>
        </div>
      )}
    </div>
  );
}
