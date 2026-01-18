import { Token } from '@suilend/sui-fe';
import {
  getAggSortedQuotesAll,
  StandardizedQuote,
  QuoteProvider
} from '@suilend/sdk';
import { Aftermath } from 'aftermath-ts-sdk';
import { AggregatorClient as CetusSdk } from '@cetusprotocol/aggregator-sdk';
import { AggregatorQuoter as FlowXQuoter } from '@flowx-finance/sdk';
import { client } from '../sdk';

let sdkCache: {
  [QuoteProvider.AFTERMATH]: Aftermath;
  [QuoteProvider.CETUS]: CetusSdk;
  [QuoteProvider.FLOWX]: FlowXQuoter;
} | null = null;

async function initializeDexSdks() {
  if (sdkCache) {
    return sdkCache;
  }

  const aftermathSdk = new Aftermath('MAINNET');
  await aftermathSdk.init();

  const cetusSdk = new CetusSdk({ client });
  const flowxSdk = new FlowXQuoter('mainnet');

  sdkCache = {
    [QuoteProvider.AFTERMATH]: aftermathSdk,
    [QuoteProvider.CETUS]: cetusSdk,
    [QuoteProvider.FLOWX]: flowxSdk,
  };

  return sdkCache;
}

// Export function to get SDK instances for building transactions
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

  // Try Aftermath first, but fallback if it times out
  let activeProviders = [
    QuoteProvider.AFTERMATH,
    QuoteProvider.CETUS,
    QuoteProvider.FLOWX,
  ];

  try {
    const quotes = await getAggSortedQuotesAll(
      sdkMap,
      activeProviders,
      tokenIn,
      tokenOut,
      amountIn
    );
    
    // Filter out quotes with very low amounts (likely errors)
    return quotes.filter(q => {
      const amount = extractRawAmountOut(q);
      return amount > 0;
    });
  } catch (error) {
    console.warn('Some DEX providers failed, trying without Aftermath:', error);
    
    // Retry without Aftermath
    activeProviders = [
      QuoteProvider.CETUS,
      QuoteProvider.FLOWX,
    ];
    
    const quotes = await getAggSortedQuotesAll(
      sdkMap,
      activeProviders,
      tokenIn,
      tokenOut,
      amountIn
    );
    
    return quotes.filter(q => {
      const amount = extractRawAmountOut(q);
      return amount > 0;
    });
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
      amountOut?: any; // Cetus BN
    };
  };

  const quoteWithRaw = quote as QuoteWithRawData;

  // Try Aftermath format (BigInt in coinOut.amount)
  if (quoteWithRaw.quote?.coinOut?.amount) {
    return Number(quoteWithRaw.quote.coinOut.amount);
  }
  
  // Try FlowX format (string in rawQuote.amountOut)
  if (quoteWithRaw.quote?.rawQuote?.amountOut) {
    return Number(quoteWithRaw.quote.rawQuote.amountOut);
  }
  
  // Try Cetus format (BN object in amountOut)
  if (quoteWithRaw.quote?.amountOut) {
    const bn = quoteWithRaw.quote.amountOut;
    // BN object has toNumber() method
    if (typeof bn === 'object' && bn !== null && typeof bn.toNumber === 'function') {
      return bn.toNumber();
    }
  }
  
  // Last resort: try to parse the out.amount BigNumber
  const raw = quote.out.amount as any;
  if (raw && typeof raw === 'object') {
    // Try toNumber first
    if (typeof raw.toNumber === 'function') {
      const num = raw.toNumber();
      // If it's a valid number > 1, use it
      if (num > 1) return num;
    }
    
    // Try to convert to string and parse
    try {
      const str = raw.toString();
      const num = parseFloat(str);
      if (!isNaN(num) && num > 1) return num;
    } catch (e) {
      // ignore
    }
  }
  
  return quote.out.amount.toNumber();
}
