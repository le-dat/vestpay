import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import type { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';

export async function sendSui(
  client: SuiClient,
  keypair: PasskeyKeypair,
  recipientAddress: string,
  amount: string
): Promise<{
  success: boolean;
  digest?: string;
  error?: string;
}> {
  try {
    const amountInMist = BigInt(Math.floor(parseFloat(amount) * 1_000_000_000));

    const tx = new Transaction();
    const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
    tx.transferObjects([coin], recipientAddress);

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
    });

    return {
      success: true,
      digest: result.digest,  
    };
  } catch (error: unknown) {
    console.error('Send transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send transaction',
    };
  }
}
