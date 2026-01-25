"use client";

export default function FaucetButton() {
  // Faucet is disabled on mainnet
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
      <p className="text-xs text-gray-400 font-medium text-center">
        Faucet only available on Testnet
      </p>
    </div>
  );
}
