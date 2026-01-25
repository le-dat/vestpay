import { useState, useEffect } from "react";
import type { CetusToken } from "@/integrations/dex/suilend/tokens";
import { fetchCetusTokens } from "@/integrations/dex/suilend/tokens";
import { SuiClient } from "@mysten/sui/client";

export function useTokenSelection(walletAddress: string) {
  const [tokenIn, setTokenIn] = useState<CetusToken | null>(null);
  const [tokenOut, setTokenOut] = useState<CetusToken | null>(null);
  const [tokenInBalance, setTokenInBalance] = useState<string>("");
  const [tokenOutBalance, setTokenOutBalance] = useState<string>("");

  const loadDefaultTokens = async () => {
    try {
      const tokens = await fetchCetusTokens();
      const sui = tokens.find((t) => t.symbol === "SUI");
      const usdc = tokens.find((t) => t.symbol === "USDC");
      if (sui) setTokenIn(sui);
      if (usdc) setTokenOut(usdc);
    } catch (error) {
      console.error("Failed to load default tokens:", error);
    }
  };

  const fetchTokenBalance = async (coinType: string): Promise<string> => {
    try {
      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });

      const balance = await client.getBalance({
        owner: walletAddress,
        coinType: coinType,
      });

      return balance.totalBalance;
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      return "0";
    }
  };

  const updateBalances = async () => {
    if (!tokenIn || !tokenOut || !walletAddress) return;

    const [inBalance, outBalance] = await Promise.all([
      fetchTokenBalance(tokenIn.coinType),
      fetchTokenBalance(tokenOut.coinType),
    ]);

    const inBalanceFormatted = (Number(inBalance) / Math.pow(10, tokenIn.decimals)).toFixed(6);
    const outBalanceFormatted = (Number(outBalance) / Math.pow(10, tokenOut.decimals)).toFixed(6);

    setTokenInBalance(inBalanceFormatted);
    setTokenOutBalance(outBalanceFormatted);
  };

  useEffect(() => {
    loadDefaultTokens();
  }, []);

  useEffect(() => {
    if (tokenIn && tokenOut && walletAddress) {
      updateBalances();
    }
  }, [tokenIn?.coinType, tokenOut?.coinType, walletAddress]);

  const handleFlipTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
  };

  return {
    tokenIn,
    setTokenIn,
    tokenOut,
    setTokenOut,
    tokenInBalance,
    tokenOutBalance,
    updateBalances,
    handleFlipTokens,
  };
}
