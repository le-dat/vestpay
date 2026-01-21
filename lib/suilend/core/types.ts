import { Transaction } from '@mysten/sui/transactions';
import { Token } from '@suilend/sui-fe';

export type DexProvider = 'cetus' | 'aftermath' | 'flowx';
export interface SwapParams {
  userAddress: string;
  tokenIn: Token;
  tokenOut: Token;  
  amountIn: string;
  slippagePercent: number;
}
export interface SwapResult {
  transaction: Transaction;
  estimatedAmountOut: number;
}
export interface CoinData {
  balance: string;
  coinType: string;
  coinObjectId: string;
}

export interface BalanceValidation {
  totalBalance: bigint;
  coinCount: number;
  isSufficient: boolean;
}
