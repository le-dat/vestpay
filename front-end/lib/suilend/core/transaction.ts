import type { StandardizedQuote } from '@suilend/sdk';
import { Token } from '@suilend/sui-fe';
import { getSwapQuotes } from './quote';
import { DEFAULT_SLIPPAGE_PERCENT } from './constants';
import type { SwapParams, SwapResult, DexProvider } from './types';
import { validateUserBalance, validateQuote } from './validators';
import { buildTransactionWithFallback } from './builders';

export async function buildSwapTransactionFromQuote(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number,
  quote: StandardizedQuote,
  _coinIn?: unknown 
): Promise<SwapResult> {
  await validateUserBalance(userAddress, tokenIn, amountIn);
  validateQuote(quote);

  console.log('Building swap transaction for provider:', quote.provider);

  const provider = quote.provider.toLowerCase() as DexProvider;
  const params: SwapParams = { userAddress, tokenIn, tokenOut, amountIn, slippagePercent };

  return buildTransactionWithFallback(provider, params);
}

export async function buildSwapTransaction(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number = DEFAULT_SLIPPAGE_PERCENT
): Promise<SwapResult & { bestQuote: StandardizedQuote }> {
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
  )

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
