import { ISwapRequest, ISwapTransactionResponse, RouteGroup } from './types';
import { createTokenObject, buildSwapTransaction } from './core/transaction';

export async function buildSwap(
  params: ISwapRequest,
): Promise<ISwapTransactionResponse> {
  const {
    userAddress,
    coinInType,
    coinOutType,
    amountIn,
    slippageTolerance = 100,
  } = params;

  const slippagePercent = slippageTolerance / 100;

  const tokenIn = createTokenObject(coinInType);
  const tokenOut = createTokenObject(coinOutType);

  const { transaction, estimatedAmountOut, bestQuote } = await buildSwapTransaction(
    userAddress,
    tokenIn,
    tokenOut,
    amountIn.toString(),
    slippagePercent
  );

  const minAmountOut = Math.floor(estimatedAmountOut * (1 - slippagePercent / 100));

  const routes: RouteGroup[] = bestQuote.routes.map(route => ({
    percent: route.percent.toNumber(),
    path: route.path.map(step => ({
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

  return {
    transaction,
    quote: {
      provider: bestQuote.provider,
      amountOut: estimatedAmountOut,
      amountOutFormatted: `${(estimatedAmountOut / 1e6).toFixed(6)} USDC`,
      exchangeRate: estimatedAmountOut / amountIn,
      routes,
    },
    slippage: {
      tolerance: slippagePercent,
      minAmountOut,
      minAmountOutFormatted: `${(minAmountOut / 1e6).toFixed(6)} USDC`,
    },
  };
}

export async function buildSwapBytes(
  params: ISwapRequest,
): Promise<string> {
  const { transaction } = await buildSwap(params);
  
  const { buildTransactionBytes } = await import('./core/signing');
  const txBytes = await buildTransactionBytes(transaction);
  
  return Buffer.from(txBytes).toString('base64');
}
