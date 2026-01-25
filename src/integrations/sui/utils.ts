import { SuiClient } from "@mysten/sui/client";
import { MIST_PER_SUI } from "./client";

export async function requestFaucet(address: string): Promise<{
  success: boolean;
  message: string;
  txDigest?: string;
}> {
  try {
    const response = await fetch("https://faucet.testnet.sui.io/gas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        FixedAmountRequest: {
          recipient: address,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error || data.message || "Faucet request failed";
      throw new Error(errorMsg);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      success: true,
      message: "Successfully received 1 SUI from faucet!",
      txDigest: data.transferredGasObjects?.[0]?.id || data.task,
    };
  } catch (error: unknown) {
    console.error("Faucet error:", error);

    let message = "Failed to request faucet. ";
    const err = error as Error;
    if (err.message && err.message.includes("rate limit")) {
      message += "Rate limit exceeded. Please try again later.";
    } else if (err.message && err.message.includes("network")) {
      message += "Network error. Please check your connection.";
    } else {
      message += err.message || "Please try again or use Discord faucet.";
    }

    return {
      success: false,
      message,
    };
  }
}

export async function getAllBalances(
  client: SuiClient,
  address: string,
): Promise<
  Array<{
    coinType: string;
    balance: string;
    symbol: string;
  }>
> {
  try {
    const balances = await client.getAllBalances({ owner: address });

    return balances.map((bal) => {
      // Extract symbol from coin type (e.g., "0x2::sui::SUI" -> "SUI")
      const parts = bal.coinType.split("::");
      const symbol = parts[parts.length - 1] || "UNKNOWN";

      const balanceInSui = (Number(bal.totalBalance) / Number(MIST_PER_SUI)).toFixed(9);
      const formatted = parseFloat(balanceInSui).toString();

      return {
        coinType: bal.coinType,
        balance: formatted,
        symbol,
      };
    });
  } catch (error) {
    console.error("Failed to get balances:", error);
    return [];
  }
}
