"use client";

import { ExchangeRate } from "@/components/swap/ExchangeRate";
import { QuotesSection } from "@/components/swap/QuotesSection";
import { DEFAULT_ROUTE_INFO, MOCK_QUOTES } from "@/components/swap/swap-data";
import { SwapActionButtons } from "@/components/swap/SwapActionButtons";
import { SwapButton } from "@/components/swap/SwapButton";
import { SwapModeToggle } from "@/components/swap/SwapModeToggle";
import { TokenInputCard } from "@/components/swap/TokenInputCard";
import { getCoinMetadata } from "@/lib/constants/defi-pools";
import { useState } from "react";

export default function SwapPage() {
  const [activeMode, setActiveMode] = useState<"Instant" | "Limit">("Instant");
  const [sellAmount, setSellAmount] = useState("1");
  const [buyAmount] = useState("0.006961814");
  const [sellToken] = useState("USDC");
  const [buyToken] = useState("SOL");

  const sellMetadata = getCoinMetadata(sellToken);
  const buyMetadata = getCoinMetadata(buyToken);

  return (
    <div className="max-w-xl mx-auto space-y-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SwapModeToggle activeMode={activeMode} onModeChange={setActiveMode} />
        <SwapActionButtons />
      </div>

      {/* Swap Cards */}
      <div className="relative space-y-1">
        <TokenInputCard
          type="sell"
          amount={sellAmount}
          token={sellToken}
          tokenIcon={sellMetadata.icon}
          usdValue="1.00"
          balance="-"
          onAmountChange={setSellAmount}
          showTokenStack
        />

        <SwapButton />

        <TokenInputCard
          type="buy"
          amount={buyAmount}
          token={buyToken}
          tokenIcon={buyMetadata.icon}
          usdValue="1.00"
          balance="-"
          readOnly
        />
      </div>

      {/* Exchange Rate */}
      <ExchangeRate fromToken="SOL" toToken="USDC" rate="143.6407" />

      {/* Action Button */}
      <button className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold text-xl rounded-2xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.98]">
        Connect Wallet
      </button>

      {/* Quotes Section */}
      <QuotesSection quotes={MOCK_QUOTES} routeInfo={DEFAULT_ROUTE_INFO} />
    </div>
  );
}
