export enum SwapProvider {
  CETUS = 'cetus',
  TURBOS = 'turbos',
  AFTERMATH = 'aftermath',
  SCALLOP = 'scallop',
}

export interface UnifiedTokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoUrl?: string;
}

export interface UnifiedPreSwapParams {
  provider: SwapProvider;
  fromToken: UnifiedTokenInfo;
  toToken: UnifiedTokenInfo;
  amount: string;
  slippage?: number;
  recipient?: string;
}

export interface UnifiedPreSwapResult {
  provider: SwapProvider;
  fromAmount: string;
  toAmount: string;
  fromAmountUsd?: number;
  toAmountUsd?: number;
  path?: string[];
  slippage?: number;
  estimatedGas?: string;
  quotes?: any[];
  fromToken?: any;
  toToken?: any;
}

export class PreSwapMiddleware {
  private static readonly MAX_CONCURRENT_REQUESTS = 4;
  private static activeRequests = 0;

  static async preSwapQuote(
    params: UnifiedPreSwapParams,
  ): Promise<UnifiedPreSwapResult> {
    try {
      // Rate limiting to prevent memory overload
      if (this.activeRequests >= this.MAX_CONCURRENT_REQUESTS) {
        await this.waitForSlot();
      }

      this.activeRequests++;

      try {
        const result = await this.executeProviderRequest(params);

        if (result.quotes && Array.isArray(result.quotes)) {
          result.quotes = result.quotes.slice(0, 3).map((quote: any) => ({
            toTokenAmount: quote?.toTokenAmount,
            fromTokenAmount: quote?.fromTokenAmount,
            route: quote?.route?.slice(0, 5), // Limit route length
          }));
        }

        return result;
      } finally {
        this.activeRequests--;
      }
    } catch (error) {
      console.error(`Pre-swap quote failed for ${params.provider}:`, error);
      throw new Error(
        `Pre-swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private static async executeProviderRequest(
    params: UnifiedPreSwapParams,
  ): Promise<UnifiedPreSwapResult> {
    switch (params.provider) {
      case SwapProvider.CETUS:
        return await this.handleCetusPreSwap(params);
      case SwapProvider.TURBOS:
        return await this.handleTurbosPreSwap(params);
      case SwapProvider.AFTERMATH:
        return await this.handleAftermathPreSwap(params);
      case SwapProvider.SCALLOP:
        return await this.handleScallopPreSwap(params);
      default:
        throw new Error(
          `Unsupported swap provider: ${String(params.provider)}`,
        );
    }
  }

  private static async waitForSlot(): Promise<void> {
    return new Promise((resolve) => {
      const checkSlot = () => {
        if (this.activeRequests < this.MAX_CONCURRENT_REQUESTS) {
          resolve();
        } else {
          setTimeout(checkSlot, 100);
        }
      };
      checkSlot();
    });
  }

  private static async handleCetusPreSwap(
    params: UnifiedPreSwapParams,
  ): Promise<UnifiedPreSwapResult> {
    try {
      const { CetusRouter } = await import('../../cetus/swap.js');

      const result = await CetusRouter.preSwapQuote({
        fromToken: params.fromToken.address,
        toToken: params.toToken.address,
        amount: params.amount,
        fromDecimals: params.fromToken.decimals,
        toDecimals: params.toToken.decimals,
        slippage: params.slippage,
      });

      return {
        provider: SwapProvider.CETUS,
        fromAmount: params.amount,
        toAmount: result.estimatedAmountOut,
        path: result.route,
        slippage: params.slippage,
        quotes: [{
          poolAddress: result.poolAddress,
          priceImpact: result.priceImpact,
          fee: result.fee,
        }],
      };
    } catch (error) {
      console.error('Cetus pre-swap failed:', error);
      throw new Error(
        `Cetus pre-swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  private static async handleTurbosPreSwap(
    params: UnifiedPreSwapParams,
  ): Promise<UnifiedPreSwapResult> {
    // TODO: Implement Turbos integration
    throw new Error('Turbos integration not yet implemented');
  }

  private static async handleAftermathPreSwap(
    params: UnifiedPreSwapParams,
  ): Promise<UnifiedPreSwapResult> {
    // TODO: Implement Aftermath integration
    throw new Error('Aftermath integration not yet implemented');
  }

  private static async handleScallopPreSwap(
    params: UnifiedPreSwapParams,
  ): Promise<UnifiedPreSwapResult> {
    // TODO: Implement Scallop integration
    throw new Error('Scallop integration not yet implemented');
  }

  static validateSwapParams(params: UnifiedPreSwapParams): void {
    if (!params.provider) {
      throw new Error('Swap provider is required');
    }

    if (!Object.values(SwapProvider).includes(params.provider)) {
      throw new Error(`Invalid swap provider: ${params.provider}`);
    }

    if (!params.fromToken?.address) {
      throw new Error('From token address is required');
    }

    if (!params.toToken?.address) {
      throw new Error('To token address is required');
    }

    if (!params.amount || parseFloat(params.amount) <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (params.slippage && (params.slippage < 0 || params.slippage > 100)) {
      throw new Error('Slippage must be between 0 and 100');
    }
  }

  static getSupportedProviders(): SwapProvider[] {
    return Object.values(SwapProvider);
  }

  static isProviderSupported(provider: string): provider is SwapProvider {
    return Object.values(SwapProvider).includes(provider as SwapProvider);
  }
}

export async function preSwapMiddleware(
  params: UnifiedPreSwapParams,
): Promise<UnifiedPreSwapResult> {
  PreSwapMiddleware.validateSwapParams(params);
  return await PreSwapMiddleware.preSwapQuote(params);
}

export default PreSwapMiddleware;
