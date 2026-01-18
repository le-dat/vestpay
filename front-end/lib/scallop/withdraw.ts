import { Transaction } from '@mysten/sui/transactions';
import { getScallopSdk, createTimeout } from './sdk';
import {
  IWithdrawRequest,
  IWithdrawTransactionResponse,
} from './types';

export async function buildWithdrawTransaction(
  params: IWithdrawRequest,
): Promise<IWithdrawTransactionResponse> {
  try {
    const { userAddress, coinName, amount } = params;
    const scallop = await getScallopSdk();
    const scallopClient = await scallop.createScallopClient();

    const txBlockPromise = scallopClient.withdraw(
      coinName,
      amount,
      false,
      userAddress,
    );

    const txBlock = await Promise.race([txBlockPromise, createTimeout(30000)]);
    (txBlock as any).setSender(userAddress);

    return {
      transaction: txBlock as Transaction,
    };
  } catch (error) {
    console.error('Build withdraw transaction failed:', error);
    throw new Error(
      `Failed to build withdraw transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}