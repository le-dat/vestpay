import { getScallopSdk, client, createTimeout } from './sdk';
import {
  IWithdrawRequest,
  IWithdrawTransactionResponse,
} from './types';

export async function buildWithdrawTransaction(
  params: IWithdrawRequest,
): Promise<IWithdrawTransactionResponse> {
  try {
    const scallop = await getScallopSdk();

    const scallopClient = await scallop.createScallopClient();
    const txBlockPromise = await scallopClient.withdraw(
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
    };
  } catch (error) {
    console.error('Build withdraw transaction failed:', error);
    throw new Error(
      `Failed to build withdraw transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}