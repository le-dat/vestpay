import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { ISupplyRequest, ISupplyTransactionResponse } from './types';

let scallopInstance: Scallop | null = null;

async function getScallopSdk(): Promise<Scallop> {
  if (!scallopInstance) {
    scallopInstance = new Scallop({
      networkType: 'mainnet',
    });
    await scallopInstance.init();
  }
  return scallopInstance;
}

export async function buildSupplyTransaction(params: ISupplyRequest): Promise<ISupplyTransactionResponse> {
  try {
    const { userAddress, coinName, amount } = params
    const scallop = await getScallopSdk();
    const scallopClient = await scallop.createScallopClient();

    const txBlock = await scallopClient.deposit(
      coinName,
      amount,
      false,
    )

    txBlock.setSender(userAddress);

    return {
      transaction: txBlock
    };
  } catch (error) {
    throw new Error(
      `Failed to build deposit transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

  