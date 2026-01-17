import { getScallopSdk, client, createTimeout } from './sdk';
import {
  BuildSupplyTransactionParams,
  BuildSupplyTransactionResult,
} from './types';

export async function buildSupplyTransaction(
  params: BuildSupplyTransactionParams,
): Promise<BuildSupplyTransactionResult> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    const marketPool = await scallopQuery.getMarketPool(params.coinName);
    const apy = marketPool?.supplyApy || 0;
    const borrowApy = marketPool?.borrowApy || 0;
    const utilizationRate = marketPool?.utilizationRate || 0;

    // For backend-only transaction building, we use deposit() which doesn't require wallet context
    // The frontend will handle the actual signing and execution
    // deposit() creates market coins (sSUI) that can be used as collateral
    const txBlockPromise = scallopClient.deposit(
      params.coinName,
      params.amount,
      false, // not using obligation-based deposit
    );

    const txBlock = await Promise.race([txBlockPromise, createTimeout(30000)]);
    const txBytes = await (
      txBlock as {
        build: (options: { client: typeof client }) => Promise<Uint8Array>;
      }
    ).build({ client });

    return {
      txBytes: Buffer.from(txBytes).toString('base64'),
      apy: Number(apy),
      marketInfo: {
        supplyApy: Number(apy),
        borrowApy: Number(borrowApy),
        utilizationRate: Number(utilizationRate),
      },
    };
  } catch (error) {
    console.error('Build supply transaction failed:', error);
    throw new Error(
      `Failed to build supply transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
