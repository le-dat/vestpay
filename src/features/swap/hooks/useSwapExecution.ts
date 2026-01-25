import { useState, useCallback } from "react";
import {
  createTokenObject,
  buildSwapTransactionFromQuote,
  type ISwapTransactionResponse,
} from "@/integrations/dex/suilend";
import type { StandardizedQuote } from "@suilend/sdk";
import { showToast } from "@/shared/components/feedback";
import type { CetusToken } from "@/integrations/dex/suilend/tokens";
import { SuiClient } from "@mysten/sui/client";

export function useSwapExecution(
  walletInfo: { address: string; email: string },
  tokenIn: CetusToken | null,
  tokenOut: CetusToken | null,
  amountIn: string,
  slippage: number,
  selectedQuote: StandardizedQuote | null,
) {
  const [loading, setLoading] = useState(false);
  const [swapData, setSwapData] = useState<ISwapTransactionResponse | null>(null);
  const [error, setError] = useState("");

  const handleBuildTransaction = useCallback(async () => {
    if (!selectedQuote || !tokenIn || !tokenOut || !walletInfo.address) return;

    setLoading(true);
    setError("");

    try {
      const currentNetwork =
        typeof window !== "undefined"
          ? localStorage.getItem("sui-network") || "mainnet"
          : "mainnet";

      if (currentNetwork !== "mainnet") {
        const msg = "Swap is only available on Mainnet. Please switch network first.";
        setError(msg);
        showToast({
          type: "error",
          title: "Wrong Network",
          message: msg,
        });
        setLoading(false);
        return;
      }

      const tokenInObj = createTokenObject(tokenIn.coinType);
      const tokenOutObj = createTokenObject(tokenOut.coinType);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);
      const slippagePercent = slippage;

      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });

      const balance = await client.getBalance({
        owner: walletInfo.address,
        coinType: tokenIn.coinType,
      });

      const balanceAmount = BigInt(balance.totalBalance);
      const requiredAmount = BigInt(Math.floor(amount));

      if (balanceAmount < requiredAmount) {
        const msg = `Insufficient ${tokenIn.symbol} balance. You have ${(Number(balanceAmount) / Math.pow(10, tokenIn.decimals)).toFixed(6)} ${tokenIn.symbol}`;
        setError(msg);
        showToast({
          type: "error",
          title: "Insufficient Balance",
          message: msg,
        });
        setLoading(false);
        return;
      }

      const result = await buildSwapTransactionFromQuote(
        walletInfo.address,
        tokenInObj,
        tokenOutObj,
        amount.toString(),
        slippagePercent,
        selectedQuote,
      );

      const estimatedAmountOutNum = Number(result.estimatedAmountOut);
      const minAmountOut = Math.floor(estimatedAmountOutNum * (1 - slippagePercent / 100));

      const routes = selectedQuote.routes.map((route) => ({
        percent: route.percent.toNumber(),
        path: route.path.map((step) => ({
          provider: step.provider,
          poolId: step.poolId,
          from: {
            coinType: step.in.coinType,
            amount: step.in.amount.toString(),
          },
          to: {
            coinType: step.out.coinType,
            amount: step.out.amount.toString(),
          },
        })),
      }));

      setSwapData({
        transaction: result.transaction,
        rebuildParams: {
          userAddress: walletInfo.address,
          tokenInType: tokenIn.coinType,
          tokenOutType: tokenOut.coinType,
          amountIn: amount.toString(),
          slippagePercent,
          rawQuote: selectedQuote,
        },
        quote: {
          provider: selectedQuote.provider,
          amountOut: estimatedAmountOutNum,
          amountOutFormatted: `${(estimatedAmountOutNum / Math.pow(10, tokenOut.decimals)).toFixed(6)} ${tokenOut.symbol}`,
          exchangeRate: estimatedAmountOutNum / Number(amount),
          routes,
        },
        slippage: {
          tolerance: slippagePercent,
          minAmountOut,
          minAmountOutFormatted: `${(minAmountOut / Math.pow(10, tokenOut.decimals)).toFixed(6)} ${tokenOut.symbol}`,
        },
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to build transaction";
      setError(errorMsg);
      showToast({
        type: "error",
        title: "Transaction Error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  }, [selectedQuote, tokenIn, tokenOut, walletInfo.address, amountIn, slippage, walletInfo]);

  return {
    loading,
    swapData,
    setSwapData,
    error,
    setError,
    handleBuildTransaction,
  };
}
