import { Transaction } from '@mysten/sui/transactions';
import { blake2b } from '@noble/hashes/blake2.js';
import { client, createTimeout } from '../sdk';
import type { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';

export async function buildTransactionBytes(
  transaction: Transaction
): Promise<Uint8Array> {
  const txBytesPromise = transaction.build({ client });
  const txBytes = await Promise.race([
    txBytesPromise,
    createTimeout(30000)
  ]) as Uint8Array;

  return txBytes;
}

export function createTransactionDigest(txBytes: Uint8Array): {
  digest: Uint8Array;
  intent: Uint8Array;
} {
  const intentBytes = new Uint8Array([0, 0, 0]);
  const intentMessage = new Uint8Array(intentBytes.length + txBytes.length);
  intentMessage.set(intentBytes);
  intentMessage.set(txBytes, intentBytes.length);

  const digest = blake2b(intentMessage, { dkLen: 32 });

  return {
    digest,
    intent: intentBytes,
  };
}

export async function prepareTransactionForSigning(
  transaction: Transaction
): Promise<{
  transactionBytes: string;
  digest: string;
  intent: string;
}> {
  const txBytes = await buildTransactionBytes(transaction);
  const { digest, intent } = createTransactionDigest(txBytes);

  return {
    transactionBytes: Buffer.from(txBytes).toString('base64'),
    digest: Buffer.from(digest).toString('base64'),
    intent: Buffer.from(intent).toString('base64'),
  };
}

export async function signAndExecuteSwapTransaction(
  transaction: Transaction,
  keypair: PasskeyKeypair
): Promise<{ digest: string }> {
  try {
    // Sign and execute transaction
    const result = await client.signAndExecuteTransaction({
      transaction,
      signer: keypair,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    if (!result.digest) {
      throw new Error('Transaction failed: No digest returned');
    }

    // Wait for transaction confirmation
    await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
      },
    });

    return {
      digest: result.digest,
    };
  } catch (error) {
    console.error('Failed to sign and execute transaction:', error);
    throw error;
  }
}
