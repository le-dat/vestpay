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

export async function getSwapQuotes(
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
): Promise<StandardizedQuote[]> {
  const sdkMap = await initializeDexSdks();

  const activeProviders = [
    QuoteProvider.AFTERMATH,
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

  return quotes;
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
    };
  };

  const quoteWithRaw = quote as QuoteWithRawData;

  if (quoteWithRaw.quote?.coinOut?.amount) {
    return Number(quoteWithRaw.quote.coinOut.amount);
  } else if (quoteWithRaw.quote?.rawQuote?.amountOut) {
    return Number(quoteWithRaw.quote.rawQuote.amountOut);
  } else {
    return quote.out.amount.toNumber();
  }
}
