import { useState, useEffect } from "react";
import { getSwapQuotes, createTokenObject } from "@/integrations/dex/suilend";
import type { StandardizedQuote } from "@suilend/sdk";
import { showToast } from "@/shared/components/feedback";
import type { CetusToken } from "@/integrations/dex/suilend/tokens";

export function useSwapQuotes(
  tokenIn: CetusToken | null,
  tokenOut: CetusToken | null,
  amountIn: string,
) {
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<StandardizedQuote[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<StandardizedQuote | null>(null);
  const [error, setError] = useState("");

  const fetchQuotes = async () => {
    if (!tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
      setQuotes([]);
      setSelectedQuote(null);
      return;
    }

    setLoading(true);
    setError("");
    setQuotes([]);
    setSelectedQuote(null);

    try {
      const tokenInObj = createTokenObject(tokenIn.coinType);
      const tokenOutObj = createTokenObject(tokenOut.coinType);
      const amount = parseFloat(amountIn) * Math.pow(10, tokenIn.decimals);

      const allQuotes = await getSwapQuotes(tokenInObj, tokenOutObj, amount.toString());

      setQuotes(allQuotes);

      if (allQuotes.length > 0) {
        setSelectedQuote(allQuotes[0]);
      } else {
        const msg = "No routes available for this pair. Try a different amount or token pair.";
        setError(msg);
        showToast({
          type: "error",
          title: "No Routes Found",
          message: msg,
        });
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to get quotes";
      if (!errorMsg.includes("timeout") && !errorMsg.includes("1500ms")) {
        setError(errorMsg);
        showToast({
          type: "error",
          title: "Quote Error",
          message: errorMsg,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0 && tokenIn && tokenOut) {
      const timer = setTimeout(() => {
        fetchQuotes();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setQuotes([]);
      setSelectedQuote(null);
    }
  }, [amountIn, tokenIn?.coinType, tokenOut?.coinType]);

  return {
    loading,
    quotes,
    selectedQuote,
    setSelectedQuote,
    error,
    fetchQuotes,
    setQuotes,
  };
}
