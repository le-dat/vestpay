/* eslint-disable @typescript-eslint/no-explicit-any */
import { Transaction } from "@mysten/sui/transactions";
import { getScallopSdk, createTimeout } from "./sdk";
import { ISupplyRequest, ISupplyTransactionResponse } from "./types";

export async function buildSupplyTransaction(
  params: ISupplyRequest,
): Promise<ISupplyTransactionResponse> {
  try {
    const { userAddress, coinName, amount, decimals } = params;
    const scallop = await getScallopSdk();
    const scallopClient = await scallop.createScallopClient();

    const rawAmount = Math.floor(amount * Math.pow(10, decimals));

    const txBlockPromise = scallopClient.deposit(coinName, rawAmount, false, userAddress);

    const txBlock = await Promise.race([txBlockPromise, createTimeout(30000)]);
    if (txBlock instanceof Transaction) {
      txBlock.setSender(userAddress);
    } else {
      (txBlock as unknown as Transaction).setSender(userAddress);
    }

    return {
      transaction: txBlock as any,
    };
  } catch (error: unknown) {
    console.error("Build supply transaction failed:", error);
    throw new Error(
      `Failed to build deposit transaction: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}
