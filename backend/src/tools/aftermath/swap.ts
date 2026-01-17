import { Aftermath } from 'aftermath-ts-sdk';

export interface AftermathPreSwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  slippage?: number;
}

export interface AftermathPreSwapResult {
  estimatedAmountOut: string;
  priceImpact: number;
  fee: string;
  route: string[];
}

export interface AftermathSwapParams {
  userAddress: string;
  fromToken: string;
  toToken: string;
  amountIn: string;
  minAmountOut: string;
  slippage?: number;
  privateKey?: string;
}

let afSdkInstance: Aftermath | null = null;

const getAftermathSdk = async (): Promise<Aftermath> => {
  if (!afSdkInstance) {
    afSdkInstance = new Aftermath('MAINNET');
    await afSdkInstance.init();
  }
  return afSdkInstance;
};

export class AftermathIntegration {
  static async preSwapQuote(
    params: AftermathPreSwapParams,
  ): Promise<AftermathPreSwapResult> {
    try {
      const afSdk = await getAftermathSdk();
      const router = afSdk.Router();

      const result = await router.getCompleteTradeRouteGivenAmountIn({
        coinInType: params.fromToken,
        coinOutType: params.toToken,
        coinInAmount: BigInt(params.amount),
        referrer: undefined,
      });

      return {
        estimatedAmountOut: result.coinOut.amount.toString(),
        priceImpact: result.spotPrice ? Number(result.spotPrice) : 0,
        fee: result.coinIn.tradeFee.toString(),
        route: result.routes.map((r, i) => `Route ${i + 1}`),
      };
    } catch (error) {
      console.error('Aftermath pre-swap quote failed:', error);
      throw new Error(
        `Aftermath pre-swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async executeSwap(
    params: AftermathSwapParams,
  ): Promise<{ hash: string }> {
    try {
      const afSdk = await getAftermathSdk();
      const router = afSdk.Router();

      // TODO: Implement Aftermath swap execution using router.getTradeTransaction()
      throw new Error('Aftermath executeSwap not implemented yet');
    } catch (error) {
      console.error('Aftermath swap execution failed:', error);
      throw new Error(
        `Aftermath swap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

export const AftermathRouter = {
  preSwapQuote: AftermathIntegration.preSwapQuote.bind(AftermathIntegration),
  executeSwap: AftermathIntegration.executeSwap.bind(AftermathIntegration),
};
