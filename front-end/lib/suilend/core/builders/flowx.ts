import { Transaction } from '@mysten/sui/transactions';
import { client } from '../../sdk';
import { getDexSdk } from '../quote';
import { FLOWX_DEADLINE_MS, PROVIDER_NAMES } from '../constants';
import type { SwapParams, SwapResult } from '../types';
import { convertToError, logSwapAttempt, logSwapSuccess, logRouteFound } from '../helpers';

export async function buildFlowXSwapTransaction(params: SwapParams): Promise<SwapResult> {
  const { userAddress, tokenIn, tokenOut, amountIn, slippagePercent } = params;

  try {
    const sdkMap = await getDexSdk();
    const flowxQuoter = sdkMap.flowx;

    logSwapAttempt(PROVIDER_NAMES.flowx, tokenIn, tokenOut, amountIn);

    const routesResult = await flowxQuoter.getRoutes({
      tokenIn: tokenIn.coinType,
      tokenOut: tokenOut.coinType,
      amountIn,
    });

    if (!routesResult || !Array.isArray(routesResult) || routesResult.length === 0) {
      throw new Error(`No routes found from FlowX ${tokenIn.symbol} -> ${tokenOut.symbol}`);
    }

    const bestRoute = routesResult[0];

    if (!bestRoute || !bestRoute.amountIn || !bestRoute.amountOut) {
      throw new Error('Invalid route data from FlowX');
    }

    logRouteFound(
      PROVIDER_NAMES.flowx,
      bestRoute.amountIn.toString(),
      bestRoute.amountOut.toString()
    );

    const { TradeBuilder } = await import('@flowx-finance/sdk');
    const amountOut = bestRoute.amountOut.toString();

    const tradeBuilder = new TradeBuilder('mainnet', routesResult)
      .sender(userAddress)
      .amountIn(amountIn)
      .amountOut(amountOut)
      .slippage(slippagePercent)
      .deadline(Date.now() + FLOWX_DEADLINE_MS);

    const trade = tradeBuilder.build();

    const transaction = new Transaction();
    transaction.setSender(userAddress);

    await trade.swap({
      client,
      tx: transaction,
      coinIn: undefined,
    });

    logSwapSuccess(PROVIDER_NAMES.flowx);

    return {
      transaction,
      estimatedAmountOut: Number(amountOut),
    };
  } catch (error) {
    const err = convertToError(error);
    console.error('FlowX swap error:', err);
    throw new Error(`FlowX swap failed: ${err.message}`);
  }
}
