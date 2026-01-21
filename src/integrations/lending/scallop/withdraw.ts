import { Transaction } from "@mysten/sui/transactions";
import { getScallopSdk, createTimeout } from "./sdk";
import { IWithdrawRequest, IWithdrawTransactionResponse } from "./types";

export async function buildWithdrawTransaction(
  params: IWithdrawRequest,
): Promise<IWithdrawTransactionResponse> {
  try {
    const { userAddress, coinName, amount, decimals } = params;
    const scallop = await getScallopSdk();
    const scallopClient = await scallop.createScallopClient();

    const rawAmount = Math.floor(amount * Math.pow(10, decimals));

    const txBlockPromise = scallopClient.withdraw(coinName, rawAmount, false, userAddress);

    const txBlock = await Promise.race([txBlockPromise, createTimeout(30000)]);
    if (txBlock instanceof Transaction) {
      txBlock.setSender(userAddress);
    } else {
      (txBlock as unknown as Transaction).setSender(userAddress);
    }

    return {
      transaction: txBlock as Transaction,
    };
  } catch (error: unknown) {
    console.error("Build withdraw transaction failed:", error);
    throw new Error(
      `Failed to build withdraw transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
