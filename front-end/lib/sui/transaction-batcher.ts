/**
 * Transaction Batcher
 * Combines multiple operations into a single transaction to reduce passkey prompts
 */

import { Transaction } from '@mysten/sui/transactions';
import { SuiClient } from '@mysten/sui/client';

export interface BatchedOperation {
  id: string;
  type: 'supply' | 'withdraw' | 'borrow' | 'repay';
  txBytes: string;
}

export class TransactionBatcher {
  private operations: BatchedOperation[] = [];
  private timeout: NodeJS.Timeout | null = null;
  private readonly BATCH_DELAY = 2000; // 2 seconds to collect operations

  addOperation(operation: BatchedOperation): void {
    this.operations.push(operation);
    this.resetTimeout();
  }

  private resetTimeout(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    // Auto-execute after delay if no more operations added
    this.timeout = setTimeout(() => {
      if (this.operations.length > 0) {
        console.log('Auto-executing batched operations:', this.operations.length);
      }
    }, this.BATCH_DELAY);
  }

  async executeBatch(
    client: SuiClient,
    signer: { address: string; sign: (tx: Transaction) => Promise<{ signature: string }> },
  ): Promise<string[]> {
    if (this.operations.length === 0) {
      throw new Error('No operations to execute');
    }

    const results: string[] = [];

    // If only one operation, execute directly
    if (this.operations.length === 1) {
      const op = this.operations[0];
      const tx = Transaction.from(op.txBytes);
      tx.setSender(signer.address);

      const { signature } = await signer.sign(tx);
      const result = await client.executeTransactionBlock({
        transactionBlock: await tx.build({ client }),
        signature,
      });

      results.push(result.digest);
    } else {
      // Combine multiple operations into one transaction
      const combinedTx = new Transaction();
      combinedTx.setSender(signer.address);

      // Merge all operations
      for (const op of this.operations) {
        const tx = Transaction.from(op.txBytes);
        // Copy transaction data to combined transaction
        // Note: This is a simplified version, actual implementation may need more work
        combinedTx.add(tx);
      }

      const { signature } = await signer.sign(combinedTx);
      const result = await client.executeTransactionBlock({
        transactionBlock: await combinedTx.build({ client }),
        signature,
      });

      results.push(result.digest);
    }

    this.clear();
    return results;
  }

  clear(): void {
    this.operations = [];
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  getOperationCount(): number {
    return this.operations.length;
  }

  hasOperations(): boolean {
    return this.operations.length > 0;
  }
}

// Singleton instance
let batcherInstance: TransactionBatcher | null = null;

export function getTransactionBatcher(): TransactionBatcher {
  if (!batcherInstance) {
    batcherInstance = new TransactionBatcher();
  }
  return batcherInstance;
}
