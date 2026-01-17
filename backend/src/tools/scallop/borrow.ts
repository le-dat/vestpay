import { getScallopSdk, client, createTimeout } from './sdk';
import {
  BuildBorrowTransactionParams,
  BuildBorrowTransactionResult,
} from './types';

export async function buildBorrowTransaction(
  params: BuildBorrowTransactionParams,
): Promise<BuildBorrowTransactionResult> {
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
      if (obligations && obligations.length > 0) {
        obligationId = obligations[0].id;
        obligationKey = obligations[0].keyId;
      } else {
        throw new Error(
          'No obligation found. Please create obligation first.',
        );
      }
    }

    if (!obligationId || !obligationKey) {
      throw new Error('Obligation ID and Key are required for borrowing');
    }

    const marketPool = await scallopQuery.getMarketPool(
      params.borrowCoinName,
    );
    const borrowApy = marketPool?.borrowApy || 0;
    const utilizationRate = marketPool?.utilizationRate || 0;

    const txBlockPromise = scallopClient.borrow(
      params.borrowCoinName,
      params.borrowAmount,
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
      marketInfo: {
        borrowApy: Number(borrowApy),
        utilizationRate: Number(utilizationRate),
      },
    };
  } catch (error) {
    console.error('Build borrow transaction failed:', error);
    throw new Error(
      `Failed to build borrow transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
