import { SuiClient } from "@mysten/sui/client";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";

export interface TransactionSummary {
  digest: string;
  timestamp: number;
  type: "sent" | "received" | "contract" | "unknown";
  status: "success" | "failed";
  amount?: string;
  amountFormatted?: string;
  coinType?: string;
  symbol?: string;
  from?: string;
  to?: string;
  gasFee?: string;
  gasFeeFormatted?: string;
}

/**
 * Get transaction history for an address
 */
export async function getTransactionHistory(
  client: SuiClient,
  address: string,
  limit: number = 20,
  _cursor?: string,
): Promise<{
  data: SuiTransactionBlockResponse[];
  nextCursor: string | null;
  hasNextPage: boolean;
}> {
  try {
    // Since FromOrToAddress is not supported by some RPCs, we do two queries and merge
    const [sent, received] = await Promise.all([
      client.queryTransactionBlocks({
        filter: { FromAddress: address },
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showBalanceChanges: true,
        },
        order: "descending",
        limit,
      }),
      client.queryTransactionBlocks({
        filter: { ToAddress: address },
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showBalanceChanges: true,
        },
        order: "descending",
        limit,
      }),
    ]);

    const allTransactions = [...sent.data, ...received.data];

    allTransactions.sort((a, b) => {
      const timeA = a.timestampMs ? parseInt(a.timestampMs) : 0;
      const timeB = b.timestampMs ? parseInt(b.timestampMs) : 0;
      return timeB - timeA;
    });

    // Remove duplicates (as some might be sent and received by same address)
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map((tx) => [tx.digest, tx])).values(),
    );

    const finalData = uniqueTransactions.slice(0, limit);

    return {
      data: finalData,
      nextCursor: null, // Cursor logic is complex with merged queries
      hasNextPage: sent.hasNextPage || received.hasNextPage,
    };
  } catch (error) {
    console.error("Failed to get transaction history:", error);
    return {
      data: [],
      nextCursor: null,
      hasNextPage: false,
    };
  }
}

/**
 * Get details for a specific transaction
 */
export async function getTransactionDetails(
  client: SuiClient,
  digest: string,
): Promise<SuiTransactionBlockResponse | null> {
  try {
    const result = await client.getTransactionBlock({
      digest,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showBalanceChanges: true,
        showObjectChanges: true,
      },
    });
    return result;
  } catch (error) {
    console.error("Failed to get transaction details:", error);
    return null;
  }
}

/**
 * Format transaction for UI display
 */
export function formatTransaction(
  tx: SuiTransactionBlockResponse,
  userAddress: string,
): TransactionSummary {
  const digest = tx.digest;
  const timestamp = tx.timestampMs ? parseInt(tx.timestampMs) : Date.now();
  const status = tx.effects?.status?.status === "success" ? "success" : "failed";

  const balanceChanges = tx.balanceChanges || [];
  const userBalanceChange = balanceChanges.find(
    (bc) =>
      bc.owner === userAddress ||
      (typeof bc.owner === "object" &&
        "AddressOwner" in bc.owner &&
        bc.owner.AddressOwner === userAddress),
  );

  let type: TransactionSummary["type"] = "unknown";
  let amount: string | undefined;
  let amountFormatted: string | undefined;
  let coinType: string | undefined;
  let symbol: string | undefined;
  let from: string | undefined;
  let to: string | undefined;

  if (userBalanceChange) {
    const changeAmount = BigInt(userBalanceChange.amount);
    coinType = userBalanceChange.coinType;

    // Extract symbol from coinType (e.g., "0x2::sui::SUI" -> "SUI")
    symbol = coinType.split("::").pop()?.toUpperCase() || "UNKNOWN";

    if (changeAmount < 0) {
      type = "sent";
      amount = (-changeAmount).toString();
      from = userAddress;
      const recipientChange = balanceChanges.find((bc) => BigInt(bc.amount) > 0);
      if (
        recipientChange &&
        typeof recipientChange.owner === "object" &&
        "AddressOwner" in recipientChange.owner
      ) {
        to = recipientChange.owner.AddressOwner;
      }
    } else if (changeAmount > 0) {
      type = "received";
      amount = changeAmount.toString();
      to = userAddress;
      const senderChange = balanceChanges.find((bc) => BigInt(bc.amount) < 0);
      if (
        senderChange &&
        typeof senderChange.owner === "object" &&
        "AddressOwner" in senderChange.owner
      ) {
        from = senderChange.owner.AddressOwner;
      }
    }

    // Format amount (assuming 9 decimals for SUI, adjust as needed)
    if (amount) {
      const decimals = coinType?.includes("::sui::SUI") ? 9 : 9;
      const amountBigInt = BigInt(amount);
      const divisor = BigInt(10 ** decimals);
      const amountNum = Number(amountBigInt) / Number(divisor);
      amountFormatted = amountNum.toFixed(4).replace(/\.?0+$/, "");
    }
  }

  if (!userBalanceChange || balanceChanges.length > 2) {
    type = "contract";
  }

  const gasUsed = tx.effects?.gasUsed;
  let gasFee: string | undefined;
  let gasFeeFormatted: string | undefined;

  if (gasUsed) {
    const totalGas =
      BigInt(gasUsed.computationCost) + BigInt(gasUsed.storageCost) - BigInt(gasUsed.storageRebate);
    gasFee = totalGas.toString();
    const gasFeeNum = Number(totalGas) / 1_000_000_000;
    gasFeeFormatted = gasFeeNum.toFixed(6);
  }

  return {
    digest,
    timestamp,
    type,
    status,
    amount,
    amountFormatted,
    coinType,
    symbol,
    from,
    to,
    gasFee,
    gasFeeFormatted,
  };
}

/**
 * Format transactions list
 */
export function formatTransactions(
  transactions: SuiTransactionBlockResponse[],
  userAddress: string,
): TransactionSummary[] {
  return transactions.map((tx) => formatTransaction(tx, userAddress));
}

/**
 * Get explorer URL for transaction
 */
export function getTransactionExplorerUrl(
  digest: string,
  network: "testnet" | "devnet" | "mainnet" = "testnet",
): string {
  const baseUrl =
    network === "mainnet" ? "https://suiscan.xyz/mainnet" : `https://suiscan.xyz/${network}`;
  return `${baseUrl}/tx/${digest}`;
}
