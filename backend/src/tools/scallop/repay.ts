import { getScallopSdk, client, createTimeout } from './sdk';
import {
  BuildRepayTransactionParams,
  BuildRepayTransactionResult,
} from './types';

export async function buildRepayTransaction(
  params: BuildRepayTransactionParams,
): Promise<BuildRepayTransactionResult> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    let obligationId = params.obligationId;
    let obligationKey = params.obligationKey;

    if (!obligationId) {
      const obligations = await scallopQuery.getObligations(
        params.userAddress,
      );
      if (!obligations || obligations.length === 0) {
        throw new Error('No obligation found for user');
      }
      obligationId = obligations[0].id;
      obligationKey = obligations[0].keyId;
    }

    if (!obligationKey) {
      throw new Error('Obligation key is required for repay operation');
    }

    const txBlockPromise = scallopClient.repay(
      params.coinName,
      params.amount,
      false,
      obligationId,
      obligationKey,
      params.userAddress,
    );

    const txBlock = await Promise.race([txBlockPromise, createTimeout(30000)]);
    const txBytes = await (
      txBlock as {
        build: (options: { client: typeof client }) => Promise<Uint8Array>;
      }
    ).build({ client });

    return {
      txBytes: Buffer.from(txBytes).toString('base64'),
      obligationId,
    };
  } catch (error) {
    console.error('Build repay transaction failed:', error);
    throw new Error(
      `Failed to build repay transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
