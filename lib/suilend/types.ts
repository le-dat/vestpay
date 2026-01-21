import { Transaction } from '@mysten/sui/transactions';
import { StandardizedQuote } from '@suilend/sdk';

export interface ISwapRequest {
  userAddress: string;
  coinInType: string;
  coinOutType: string;
  amountIn: number;
  minAmountOut?: number;
  slippageTolerance?: number;
}

export interface SwapRoute {
  provider: string;
  poolId?: string;
  from: string;
  to: string;
  amountIn: string;
  amountOut: string;
}

export interface SwapRouteGroup {
  percent: string;
  hops: number;
  path: SwapRoute[];
}

export interface RouteStep {
  provider: string;
  poolId?: string;
  from: {
    coinType: string;
    amount: string;
  };
  to: {
    coinType: string;
    amount: string;
  };
}

export interface RouteGroup {
  percent: number;
  path: RouteStep[];
}

export interface ISwapTransactionResponse {
  transaction: Transaction;
  // Parameters to rebuild transaction (for React state storage)
  rebuildParams?: {
    userAddress: string;
    tokenInType: string;
    tokenOutType: string;
    amountIn: string;
    slippagePercent: number;
    rawQuote: StandardizedQuote;
  };
  quote: {
    provider: string;
    amountOut: number;
    amountOutFormatted: string;
    exchangeRate: number;
    routes: RouteGroup[];
  };
  slippage: {
    tolerance: number;
    minAmountOut: number;
    minAmountOutFormatted: string;
  };
}
