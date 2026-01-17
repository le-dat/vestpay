import {
  SwapProvider,
  UnifiedTokenInfo,
  UnifiedPreSwapResult,
} from './pre-swap';

export interface UnifiedSwapParams {
  provider: SwapProvider;
  userAddress: string;
  fromToken: UnifiedTokenInfo;
  toToken: UnifiedTokenInfo;
  amountIn: string;
  amountOut: string;
  path?: string[];
  slippage?: number;
  privateKey?: string;
  preSwapResult?: UnifiedPreSwapResult;
}

export interface UnifiedSwapResult {
  provider: SwapProvider;
  hash?: string;
  success: boolean;
  error?: string;
  transactionData?: any;
}

export class SwapExecutionMiddleware {
  // Execute actual swap based on pre-swap result
  static async executeSwap(
    params: UnifiedSwapParams,
  ): Promise<UnifiedSwapResult> {
    try {
      this.validateExecuteSwapParams(params);

      const result = await this.executeProviderSwap(params);
      return result;
    } catch (error) {
      console.error(`Swap execution failed for ${params.provider}:`, error);
      return {
        provider: params.provider,
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown swap execution error',
      };
    }
  }

  private static async executeProviderSwap(
    params: UnifiedSwapParams,
  ): Promise<UnifiedSwapResult> {
    switch (params.provider) {
      case SwapProvider.CETUS:
        return await this.handleCetusSwap(params);
      case SwapProvider.TURBOS:
        return await this.handleTurbosSwap(params);
      case SwapProvider.AFTERMATH:
        return await this.handleAftermathSwap(params);
      case SwapProvider.SCALLOP:
        return await this.handleScallopSwap(params);
      default:
        throw new Error(
          `Unsupported swap provider: ${String(params.provider)}`,
        );
    }
  }

  private static async handleCetusSwap(
    params: UnifiedSwapParams,
  ): Promise<UnifiedSwapResult> {
    try {
      const { CetusRouter } = await import('../../cetus/swap.js');

      const result = await CetusRouter.executeSwap({
        userAddress: params.userAddress,
        fromToken: params.fromToken.address,
        toToken: params.toToken.address,
        amountIn: params.amountIn,
        minAmountOut: params.amountOut,
        fromDecimals: params.fromToken.decimals,
        toDecimals: params.toToken.decimals,
        slippage: params.slippage,
        privateKey: params.privateKey,
      });

      return {
        provider: SwapProvider.CETUS,
        success: true,
        hash: result.hash,
      };
    } catch (error) {
      console.error('Cetus swap execution failed:', error);
      throw error;
    }
  }

  private static async handleTurbosSwap(
    params: UnifiedSwapParams,
  ): Promise<UnifiedSwapResult> {
    // TODO: Implement Turbos swap execution
    throw new Error('Turbos swap execution not yet implemented');
  }

  private static async handleAftermathSwap(
    params: UnifiedSwapParams,
  ): Promise<UnifiedSwapResult> {
    // TODO: Implement Aftermath swap execution
    throw new Error('Aftermath swap execution not yet implemented');
  }

  private static async handleScallopSwap(
    params: UnifiedSwapParams,
  ): Promise<UnifiedSwapResult> {
    // TODO: Implement Scallop swap execution
    throw new Error('Scallop swap execution not yet implemented');
  }

  static validateExecuteSwapParams(params: UnifiedSwapParams): void {
    if (!params.provider) {
      throw new Error('Swap provider is required');
    }

    if (!Object.values(SwapProvider).includes(params.provider)) {
      throw new Error(`Invalid swap provider: ${params.provider}`);
    }

    if (!params.userAddress) {
      throw new Error('User address is required');
    }

    if (!params.fromToken?.address) {
      throw new Error('From token address is required');
    }

    if (!params.toToken?.address) {
      throw new Error('To token address is required');
    }

    if (!params.amountIn || parseFloat(params.amountIn) <= 0) {
      throw new Error('Amount in must be greater than 0');
    }

    if (!params.amountOut || parseFloat(params.amountOut) <= 0) {
      throw new Error('Amount out must be greater than 0');
    }
  }
}

export async function executeSwapMiddleware(
  params: UnifiedSwapParams,
): Promise<UnifiedSwapResult> {
  return await SwapExecutionMiddleware.executeSwap(params);
}

export default SwapExecutionMiddleware;
