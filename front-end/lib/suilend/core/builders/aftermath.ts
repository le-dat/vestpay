import { getDexSdk } from '../quote';
import { PROVIDER_NAMES } from '../constants';
import type { SwapParams, SwapResult } from '../types';
import { convertSlippageToDecimal, convertToError, extractAmountOut, logSwapAttempt, logSwapSuccess, logRouteFound } from '../helpers';

export async function buildAftermathSwapTransaction(params: SwapParams): Promise<SwapResult> {
  const { userAddress, tokenIn, tokenOut, amountIn, slippagePercent } = params;

  try {
    const sdkMap = await getDexSdk();
    const aftermathSdk = sdkMap.aftermath;
    const router = aftermathSdk.Router();

    logSwapAttempt(PROVIDER_NAMES.aftermath, tokenIn, tokenOut, amountIn);

    const route = await router.getCompleteTradeRouteGivenAmountIn({
      coinInType: tokenIn.coinType,
      coinOutType: tokenOut.coinType,
      coinInAmount: BigInt(amountIn),
    });

    if (!route || !route.coinOut || !route.coinOut.amount) {
      throw new Error('No valid route found from Aftermath');
    }

    logRouteFound(
      PROVIDER_NAMES.aftermath,
      route.coinIn?.amount?.toString() || amountIn,
      route.coinOut.amount.toString()
    );

    const transaction = await router.getTransactionForCompleteTradeRoute({
      completeRoute: route,
      walletAddress: userAddress,
      slippage: convertSlippageToDecimal(slippagePercent),
    });

    logSwapSuccess(PROVIDER_NAMES.aftermath);

    return {
      transaction,
      estimatedAmountOut: extractAmountOut(route.coinOut.amount),
    };
  } catch (error) {
    const err = convertToError(error);
    console.error('Aftermath swap error:', err);
    throw new Error(`Aftermath swap failed: ${err.message}`);
  }
}
