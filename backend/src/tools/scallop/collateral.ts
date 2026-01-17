import { getScallopSdk, client, createTimeout } from './sdk';
import {
  BuildWithdrawCollateralTransactionParams,
  BuildWithdrawCollateralTransactionResult,
} from './types';

export async function buildWithdrawCollateralTransaction(
  params: BuildWithdrawCollateralTransactionParams,
): Promise<BuildWithdrawCollateralTransactionResult> {
  try {
    const scallop = await getScallopSdk();
    const scallopClient = await scallop.createScallopClient();

    const txBlockPromise = scallopClient.withdrawCollateral(
      params.coinName,
      params.amount,
      false,
      params.obligationId,
      params.obligationKey,
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
      obligationId: params.obligationId,
    };
  } catch (error) {
    console.error('Build withdraw collateral transaction failed:', error);
    throw new Error(
      `Failed to build withdraw collateral transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
