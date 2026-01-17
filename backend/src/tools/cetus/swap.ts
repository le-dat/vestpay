import { initCetusSDK } from '@cetusprotocol/cetus-sui-clmm-sdk';
import { SuiClient } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { calculateAmountBeforeDecimals, calculateAmountAfterDecimals } from '../../utils/decimals';

export interface CetusPreSwapParams {
  fromToken: string;
  toToken: string;
  amount: string;
  fromDecimals: number;
  toDecimals: number;
  slippage?: number;
}

export interface CetusPreSwapResult {
  estimatedAmountOut: string;
  priceImpact: number;
  fee: string;
  route: string[];
  poolAddress?: string;
}

export interface CetusSwapParams {
  userAddress: string;
  fromToken: string;
  toToken: string;
  amountIn: string;
  minAmountOut: string;
  fromDecimals: number;
  toDecimals: number;
  slippage?: number;
  privateKey?: string;
}

export class CetusIntegration {
  private static sdk: any;
  private static client: SuiClient;

  static async initSDK(): Promise<any> {
    if (!this.sdk) {
      // Initialize Cetus SDK for mainnet
      this.sdk = initCetusSDK({
        network: 'mainnet',
        fullNodeUrl: 'https://fullnode.mainnet.sui.io',
      });

      this.client = new SuiClient({ url: 'https://fullnode.mainnet.sui.io' });
    }
    return this.sdk;
  }

  static async preSwapQuote(
    params: CetusPreSwapParams,
  ): Promise<CetusPreSwapResult> {
    try {
      const sdk = await this.initSDK();

      // Convert amount to smallest unit
      const amountIn = calculateAmountBeforeDecimals(
        params.amount,
        params.fromDecimals,
      );

      // Find pool for the token pair
      const pools = await sdk.Pool.getPools({
        coinTypeA: params.fromToken,
        coinTypeB: params.toToken,
      });

      if (!pools || pools.length === 0) {
        throw new Error(
          `No liquidity pool found for ${params.fromToken} -> ${params.toToken}`,
        );
      }

      // Use the pool with highest TVL
      const pool = pools[0];

      // Calculate swap output
      const swapResult = await sdk.Swap.preswap({
        pool: pool.poolAddress,
        currentSqrtPrice: pool.current_sqrt_price,
        coinTypeA: params.fromToken,
        coinTypeB: params.toToken,
        decimalsA: params.fromDecimals,
        decimalsB: params.toDecimals,
        a2b: params.fromToken === pool.coinTypeA,
        byAmountIn: true,
        amount: amountIn.toString(),
      });

      // Convert output amount back to human-readable
      const estimatedAmountOut = calculateAmountAfterDecimals(
        swapResult.estimatedAmountOut || swapResult.amount_out,
        params.toDecimals,
      );

      return {
        estimatedAmountOut,
        priceImpact: swapResult.priceImpact || 0,
        fee: swapResult.fee || '0',
        route: [params.fromToken, params.toToken],
        poolAddress: pool.poolAddress,
      };
    } catch (error) {
      console.error('Cetus pre-swap quote failed:', error);
      throw new Error(
        `Cetus pre-swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async executeSwap(
    params: CetusSwapParams,
  ): Promise<{ hash: string }> {
    try {
      const sdk = await this.initSDK();

      // Convert amounts to smallest unit
      const amountIn = calculateAmountBeforeDecimals(
        params.amountIn,
        params.fromDecimals,
      );
      const minAmountOut = calculateAmountBeforeDecimals(
        params.minAmountOut,
        params.toDecimals,
      );

      // Apply slippage to min amount out
      const slippageMultiplier = 1 - (params.slippage || 0.5) / 100;
      const adjustedMinAmountOut = Math.floor(minAmountOut * slippageMultiplier);

      // Find pool
      const pools = await sdk.Pool.getPools({
        coinTypeA: params.fromToken,
        coinTypeB: params.toToken,
      });

      if (!pools || pools.length === 0) {
        throw new Error(
          `No liquidity pool found for ${params.fromToken} -> ${params.toToken}`,
        );
      }

      const pool = pools[0];

      // Build swap transaction
      const tx = new TransactionBlock();

      const swapPayload = await sdk.Swap.createSwapTransactionPayload({
        pool: pool.poolAddress,
        a2b: params.fromToken === pool.coinTypeA,
        byAmountIn: true,
        amount: amountIn.toString(),
        amountLimit: adjustedMinAmountOut.toString(),
        coinTypeA: params.fromToken,
        coinTypeB: params.toToken,
      });

      // Add swap to transaction
      tx.moveCall(swapPayload);

      // Sign and execute transaction
      if (params.privateKey) {
        const keypair = Ed25519Keypair.fromSecretKey(
          Buffer.from(params.privateKey, 'base64'),
        );

        const result = await this.client.signAndExecuteTransactionBlock({
          transactionBlock: tx,
          signer: keypair,
          options: {
            showEffects: true,
          },
        });

        return { hash: result.digest };
      } else {
        throw new Error('Private key required for swap execution');
      }
    } catch (error) {
      console.error('Cetus swap execution failed:', error);
      throw new Error(
        `Cetus swap execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}

export const CetusRouter = {
  preSwapQuote: CetusIntegration.preSwapQuote.bind(CetusIntegration),
  executeSwap: CetusIntegration.executeSwap.bind(CetusIntegration),
};
