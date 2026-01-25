"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { Modal } from "@/shared/components/ui";
import { useWallet } from "@/features/wallet";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { address } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deposit to Wallet">
      <div className="space-y-6 ">
        {/* QR Code */}
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 overflow-hidden">
            {address ? (
              <QRCodeSVG
                value={address}
                size={256}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center bg-gray-50 rounded-xl">
                <p className="text-gray-400 text-sm">Loading...</p>
              </div>
            )}
          </div>
        </div>

        {/* Address Display */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Your Wallet Address
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={address}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-mono text-sm text-gray-900 focus:outline-none"
            />
            <button
              onClick={handleCopyAddress}
              className="p-3 bg-primary hover:bg-primary/90 text-white rounded-2xl transition-all"
              title={copied ? "Copied!" : "Copy address"}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center">Send SUI tokens to this address</p>
        </div>

        {/* Instructions */}
        <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-700">How to deposit:</p>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>Scan the QR code with your mobile wallet</li>
            <li>Or copy the address and send funds from another wallet</li>
            <li>Only send SUI tokens to this address</li>
            <li>Transactions may take a few seconds to confirm</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
