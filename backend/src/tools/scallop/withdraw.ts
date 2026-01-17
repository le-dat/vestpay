import { getScallopSdk, client, createTimeout } from './sdk';
import {
  BuildWithdrawTransactionParams,
  BuildWithdrawTransactionResult,
} from './types';

export async function buildWithdrawTransaction(
  params: BuildWithdrawTransactionParams,
): Promise<BuildWithdrawTransactionResult> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    const marketPool = await scallopQuery.getMarketPool(params.coinName);
    const supplyApy = marketPool?.supplyApy || 0;
    const borrowApy = marketPool?.borrowApy || 0;

    const txBlockPromise = scallopClient.withdraw(
      params.coinName,
      params.amount,
      false,
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
      marketInfo: {
        supplyApy: Number(supplyApy),
        borrowApy: Number(borrowApy),
      },
    };
  } catch (error) {
    console.error('Build withdraw transaction failed:', error);
    throw new Error(
      `Failed to build withdraw transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
