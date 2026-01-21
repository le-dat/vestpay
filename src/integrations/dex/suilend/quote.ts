import { Token } from "@suilend/sui-fe";
import { getAggSortedQuotesAll, StandardizedQuote, QuoteProvider } from "@suilend/sdk";
import { Aftermath } from "aftermath-ts-sdk";
import { AggregatorClient as CetusSdk } from "@cetusprotocol/aggregator-sdk";
import { AggregatorQuoter as FlowXQuoter } from "@flowx-finance/sdk";
import { client } from "./sdk";

let sdkCache: {
  [QuoteProvider.AFTERMATH]: Aftermath;
  [QuoteProvider.CETUS]: CetusSdk;
  [QuoteProvider.FLOWX]: FlowXQuoter;
} | null = null;

async function initializeDexSdks() {
  if (sdkCache) {
    return sdkCache;
  }

  const aftermathSdk = new Aftermath("MAINNET");
  await aftermathSdk.init();

  const cetusSdk = new CetusSdk({ client });
  const flowxSdk = new FlowXQuoter("mainnet");

  sdkCache = {
    [QuoteProvider.AFTERMATH]: aftermathSdk,
    [QuoteProvider.CETUS]: cetusSdk,
    [QuoteProvider.FLOWX]: flowxSdk,
  };

  return sdkCache;
}

export async function getDexSdk() {
  const sdkMap = await initializeDexSdks();
  return {
    aftermath: sdkMap[QuoteProvider.AFTERMATH],
    cetus: sdkMap[QuoteProvider.CETUS],
    flowx: sdkMap[QuoteProvider.FLOWX],
  };
}

export async function getSwapQuotes(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
): Promise<StandardizedQuote[]> {
  const sdkMap = await initializeDexSdks();

  let activeProviders = [QuoteProvider.AFTERMATH, QuoteProvider.CETUS, QuoteProvider.FLOWX];

  try {
    const quotes = await getAggSortedQuotesAll(
      sdkMap,
      activeProviders,
      tokenIn,
      tokenOut,
      amountIn,
    );

    const validQuotes = quotes.filter((q) => {
      try {
        const amount = extractRawAmountOut(q);
        return amount > 0;
      } catch {
        return false;
      }
    });

    if (validQuotes.length > 0) {
      return validQuotes;
    }

    throw new Error("No valid quotes found");
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    const isTimeout = errorMsg.includes("timeout") || errorMsg.includes("1500ms");

    if (!isTimeout) {
      console.warn("Some DEX providers had issues:", errorMsg);
    }

    try {
      activeProviders = [QuoteProvider.CETUS, QuoteProvider.FLOWX];

      const quotes = await getAggSortedQuotesAll(
        sdkMap,
        activeProviders,
        tokenIn,
        tokenOut,
        amountIn,
      );

      const validQuotes = quotes.filter((q) => {
        try {
          const amount = extractRawAmountOut(q);
          return amount > 0;
        } catch {
          return false;
        }
      });

      return validQuotes;
    } catch {
      return [];
    }
  }
}

export function extractRawAmountOut(quote: StandardizedQuote): number {
  type QuoteWithRawData = StandardizedQuote & {
    quote?: {
      coinOut?: {
        amount: bigint | number;
      };
      rawQuote?: {
        amountOut: string | number;
      };
      amountOut?: { toString: () => string; toNumber: () => number }; // Cetus BN
    };
  };

  const quoteWithRaw = quote as QuoteWithRawData;

  if (quoteWithRaw.quote?.coinOut?.amount) {
    return Number(quoteWithRaw.quote.coinOut.amount);
  }

  if (quoteWithRaw.quote?.rawQuote?.amountOut) {
    return Number(quoteWithRaw.quote.rawQuote.amountOut);
  }

  if (quoteWithRaw.quote?.amountOut) {
    const bn = quoteWithRaw.quote.amountOut;
    // BN object has toNumber() method
    if (typeof bn === "object" && bn !== null && typeof bn.toNumber === "function") {
      return bn.toNumber();
    }
  }

  const raw = quote.out.amount as unknown;
  if (raw && typeof raw === "object") {
    // Try toNumber first
    if ("toNumber" in raw && typeof (raw as { toNumber: () => number }).toNumber === "function") {
      const num = (raw as { toNumber: () => number }).toNumber();
      // If it's a valid number > 1, use it
      if (num > 1) return num;
    }

    // Try to convert to string and parse
    try {
      const str = String(raw);
      const num = parseFloat(str);
      if (!isNaN(num) && num > 1) return num;
    } catch {
      // ignore
    }
  }

  return quote.out.amount.toNumber();
}
