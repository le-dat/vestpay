import { DEX_PROVIDERS } from '../constants';
import type { DexProvider, SwapParams, SwapResult } from '../types';
import { convertToError } from '../helpers';
import { buildCetusSwapTransaction } from './cetus';
import { buildAftermathSwapTransaction } from './aftermath';
import { buildFlowXSwapTransaction } from './flowx';

type SwapTransactionBuilder = (params: SwapParams) => Promise<SwapResult>;

export const providerBuilders: Record<DexProvider, SwapTransactionBuilder> = {
  cetus: buildCetusSwapTransaction,
  aftermath: buildAftermathSwapTransaction,
  flowx: buildFlowXSwapTransaction,
};

export async function buildTransactionWithFallback(
  provider: DexProvider,
  params: SwapParams
): Promise<SwapResult> {
  const providerOrder = [provider, ...DEX_PROVIDERS].filter(
    (p, i, arr) => arr.indexOf(p) === i
  ) as DexProvider[];

  let lastError: Error | null = null;

  for (const currentProvider of providerOrder) {
    try {
      console.log(`Attempting to build transaction with ${currentProvider}...`);
      const builder = providerBuilders[currentProvider];
      return await builder(params);
    } catch (error) {
      lastError = convertToError(error);
      console.warn(`${currentProvider} failed:`, lastError.message);
    }
  }

  throw new Error(`All DEX providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

export { buildCetusSwapTransaction } from './cetus';
export { buildAftermathSwapTransaction } from './aftermath';
export { buildFlowXSwapTransaction } from './flowx';
