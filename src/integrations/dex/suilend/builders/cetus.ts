import { Transaction } from '@mysten/sui/transactions';
import type { AggregatorClient } from '@cetusprotocol/aggregator-sdk';
import { client } from '../sdk';
import { PROVIDER_NAMES } from '../constants';
import type { SwapParams, SwapResult } from '../types';
import { convertSlippageToDecimal, extractAmountOut, logSwapAttempt, logSwapSuccess, logRouteFound } from '../helpers';

let cetusSdkInstance: AggregatorClient | null = null;

async function getCetusSdk(): Promise<AggregatorClient> {
  if (!cetusSdkInstance) {
    const { AggregatorClient } = await import('@cetusprotocol/aggregator-sdk');
    cetusSdkInstance = new AggregatorClient({ client });
  }
  return cetusSdkInstance;
}

export async function buildCetusSwapTransaction(params: SwapParams): Promise<SwapResult> {
  const { userAddress, tokenIn, tokenOut, amountIn, slippagePercent } = params;
  const cetusSdk = await getCetusSdk();

  logSwapAttempt(PROVIDER_NAMES.cetus, tokenIn, tokenOut, amountIn);

  const routerResult = await cetusSdk.findRouters({
    from: tokenIn.coinType,
    target: tokenOut.coinType,
    amount: amountIn,
    byAmountIn: true,
  });

  if (!routerResult || routerResult.insufficientLiquidity) {
    throw new Error('No liquidity available for this swap on Cetus');
  }

  logRouteFound(
    PROVIDER_NAMES.cetus,
    routerResult.amountIn?.toString() || amountIn,
    routerResult.amountOut?.toString() || '0'
  );

  const transaction = new Transaction();
  transaction.setSender(userAddress);

  await cetusSdk.fastRouterSwap({
    router: routerResult,
    txb: transaction,
    slippage: convertSlippageToDecimal(slippagePercent),
    refreshAllCoins: true,
  });

  logSwapSuccess(PROVIDER_NAMES.cetus);

  return {
    transaction,
    estimatedAmountOut: extractAmountOut(routerResult.amountOut),
  };
}
