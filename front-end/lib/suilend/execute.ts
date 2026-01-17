import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { SuiClient } from '@mysten/sui/client';
import { ISwapRequest } from './types';
import { buildSwap } from './swap';
import { prepareTransactionForSigning } from './core/signing';

export interface ExecuteResult {
  success: boolean;
  digest: string;
  quote: {
    provider: string;
    amountOut: number;
    amountOutFormatted: string;
  };
  effects?: unknown;
}

export async function executeSwapWithPasskey(
  params: ISwapRequest,
  privateKey: string,
): Promise<ExecuteResult> {
  const result = await buildSwap(params);

  const { transactionBytes, digest } = await prepareTransactionForSigning(
    result.transaction
  );

  const keypair = Ed25519Keypair.fromSecretKey(
    Buffer.from(privateKey, 'hex')
  );

  const digestBytes = Buffer.from(digest, 'base64');
  const signatureData = await keypair.sign(digestBytes);

  const client = new SuiClient({
    url: 'https://fullnode.mainnet.sui.io'
  });

  const txResult = await client.executeTransactionBlock({
    transactionBlock: transactionBytes,
    signature: signatureData.signature,
    options: {
      showEffects: true,
      showObjectChanges: true,
    },
  });

  return {
    success: true,
    digest: txResult.digest,
    quote: {
      provider: result.quote.provider,
      amountOut: result.quote.amountOut,
      amountOutFormatted: result.quote.amountOutFormatted,
    },
    effects: txResult.effects,
  };
}

export async function prepareSwapForSigning(
  params: ISwapRequest,
): Promise<{
  quote: {
    provider: string;
    amountOut: number;
    amountOutFormatted: string;
  };
  slippage: {
    tolerance: number;
    minAmountOut: number;
    minAmountOutFormatted: string;
  };
  transactionBytes: string;
  digest: string;
}> {
  const result = await buildSwap(params);
  const signingData = await prepareTransactionForSigning(result.transaction);

  return {
    quote: result.quote,
    slippage: result.slippage,
    transactionBytes: signingData.transactionBytes,
    digest: signingData.digest,
  };
}
