import type { StandardizedQuote } from "@suilend/sdk";
import { Token } from "@suilend/sui-fe";
import { client } from "./sdk";
import type { BalanceValidation } from "./types";

export async function validateUserBalance(
  userAddress: string,
  tokenIn: Token,
  amountIn: string,
): Promise<BalanceValidation> {
  const coins = await client.getCoins({
    owner: userAddress,
    coinType: tokenIn.coinType,
  });

  if (!coins.data || coins.data.length === 0) {
    throw new Error(`No ${tokenIn.symbol || tokenIn.coinType} coins found in wallet`);
  }

  const totalBalance = coins.data.reduce(
    (sum: bigint, coin) => sum + BigInt(coin.balance),
    BigInt(0),
  );
  const amountNeeded = BigInt(amountIn);

  if (totalBalance < amountNeeded) {
    throw new Error(`Insufficient balance. Need ${amountIn}, have ${totalBalance.toString()}`);
  }

  return {
    isValid: true,
  };
}

export function validateQuote(quote: StandardizedQuote): void {
  if (!quote || !quote.provider || !quote.routes || quote.routes.length === 0) {
    throw new Error("Invalid quote object provided");
  }
}
