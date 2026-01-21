import { DexProvider, SwapParams, SwapResult } from "../types";
import { buildAftermathSwapTransaction } from "./aftermath";
import { buildCetusSwapTransaction } from "./cetus";
import { buildFlowXSwapTransaction } from "./flowx";

export { buildAftermathSwapTransaction, buildCetusSwapTransaction, buildFlowXSwapTransaction };

export async function buildTransactionWithFallback(
  provider: DexProvider,
  params: SwapParams,
): Promise<SwapResult> {
  switch (provider) {
    case "cetus":
      return buildCetusSwapTransaction(params);
    case "aftermath":
      return buildAftermathSwapTransaction(params);
    case "flowx":
      return buildFlowXSwapTransaction(params);
    default:
      throw new Error(`Unsupported DEX provider: ${provider}`);
  }
}
