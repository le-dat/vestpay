import { Transaction, TransactionObjectArgument } from '@mysten/sui/transactions';
import { getSwapTransaction, StandardizedQuote, QuoteProvider } from '@suilend/sdk';
import { Token } from '@suilend/sui-fe';
import { client } from '../sdk';
import { getSwapQuotes, extractRawAmountOut } from './quote';

async function initializeDexSdks() {
  const { Aftermath } = await import('aftermath-ts-sdk');
  const { AggregatorClient: CetusSdk } = await import('@cetusprotocol/aggregator-sdk');
  const { AggregatorQuoter: FlowXQuoter } = await import('@flowx-finance/sdk');

  const aftermathSdk = new Aftermath('MAINNET');
  await aftermathSdk.init();

  const cetusSdk = new CetusSdk({ client });
  const flowxSdk = new FlowXQuoter('mainnet');

  return {
    [QuoteProvider.AFTERMATH]: aftermathSdk,
    [QuoteProvider.CETUS]: cetusSdk,
    [QuoteProvider.FLOWX]: flowxSdk,
  };
}

export async function buildSwapTransactionFromQuote(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number,
  quote: StandardizedQuote,
  coinIn?: TransactionObjectArgument,
): Promise<{
  transaction: Transaction;
  estimatedAmountOut: number;
}> {
  const sdkMap = await initializeDexSdks();

  const partnerIdMap = {
    [QuoteProvider.CETUS]: '',
    [QuoteProvider.BLUEFIN7K]: '',
    [QuoteProvider.FLOWX]: '0xa86afe84461da8ac21883b3279b6a7f0883918925749e06101ed29d7c4966e91',
  };

  const transaction = new Transaction();
  transaction.setSender(userAddress);

  const result = await getSwapTransaction(
    client,
    userAddress,
    quote,
    slippagePercent,
    sdkMap,
    partnerIdMap,
    transaction,
    coinIn
  );

  const rawAmountOut = extractRawAmountOut(quote);

  return {
    ...result,
    estimatedAmountOut: rawAmountOut,
  };
}

export async function buildSwapTransaction(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number = 1,
): Promise<{
  transaction: Transaction;
  estimatedAmountOut: number;
  bestQuote: StandardizedQuote;
}> {
  const quotes = await getSwapQuotes(tokenIn, tokenOut, amountIn);

  if (!quotes || quotes.length === 0) {
    throw new Error('No swap quotes available');
  }

  const bestQuote = quotes[0];
  const result = await buildSwapTransactionFromQuote(
    userAddress,
    tokenIn,
    tokenOut,
    amountIn,
    slippagePercent,
    bestQuote
  );

  return {
    ...result,
    bestQuote,
  };
}

export function createTokenObject(coinType: string): Token {
  return {
    coinType,
    type: coinType,
    decimals: 9,
    description: '',
    name: '',
    symbol: '',
  } as unknown as Token;
}
