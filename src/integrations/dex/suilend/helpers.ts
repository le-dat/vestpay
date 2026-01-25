/* eslint-disable @typescript-eslint/no-explicit-any */

import { Token } from "@suilend/sui-fe";
import { SLIPPAGE_DECIMAL_DIVISOR } from "./constants";

export function convertToError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

export function extractAmountOut(amountOut: unknown): string {
  if (!amountOut) return "0";

  if (
    typeof amountOut === "object" &&
    amountOut !== null &&
    "toString" in amountOut &&
    typeof (amountOut as any).toString === "function"
  ) {
    return (amountOut as { toString: () => string }).toString();
  }

  return String(amountOut);
}

export function convertSlippageToDecimal(slippagePercent: number): number {
  return slippagePercent / SLIPPAGE_DECIMAL_DIVISOR;
}

export function logSwapAttempt(
  provider: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
): void {
  console.log(`Getting ${provider} route for swap:`, {
    from: tokenIn.coinType,
    to: tokenOut.coinType,
    amount: amountIn,
  });
}

export function logSwapSuccess(provider: string): void {
  console.log(`${provider} transaction built successfully`);
}

export function logRouteFound(provider: string, amountIn: string, amountOut: string): void {
  console.log(`${provider} route found:`, {
    amountIn,
    amountOut,
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delayMs: number = 1000,
  validator?: (result: T) => boolean,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (!validator || validator(result)) {
        return result;
      }

      lastError = new Error("Validation failed");
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1}/${retries} failed:`, error);
    }

    if (i < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
