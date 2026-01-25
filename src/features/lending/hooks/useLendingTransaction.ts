/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { showToast } from "@/shared/components/feedback";
import type { LendingPool } from "@/features/lending";
import { recoverPasskeyWallet } from "@/integrations/sui/passkey";
import { signAndExecuteSwapTransaction } from "@/integrations/dex/suilend";

export interface UseLendingTransactionParams {
  pool: LendingPool;
  walletAddress: string;
  onSuccess: () => void;
  onClose: () => void;
}

export interface UseLendingTransactionReturn {
  loading: boolean;
  executeTransaction: (
    amount: number,
    buildTransaction: (params: {
      userAddress: string;
      coinName: string;
      amount: number;
    }) => Promise<{ transaction: any }>,
    successMessage: string,
  ) => Promise<void>;
}

export function useLendingTransaction({
  pool,
  walletAddress,
  onSuccess,
  onClose,
}: UseLendingTransactionParams): UseLendingTransactionReturn {
  const [loading, setLoading] = useState(false);

  const executeTransaction = useCallback(
    async (
      amount: number,
      buildTransaction: (params: {
        userAddress: string;
        coinName: string;
        amount: number;
      }) => Promise<{ transaction: any }>,
      successMessage: string,
    ) => {
      setLoading(true);

      try {
        const wallet = await recoverPasskeyWallet();
        if (!wallet) {
          throw new Error("Failed to recover wallet. Please login again.");
        }

        console.log("Building transaction...");
        const result = await buildTransaction({
          userAddress: walletAddress,
          coinName: pool.coin.toLowerCase(),
          amount,
        });

        console.log("Signing and executing transaction...");
        const txResult = await signAndExecuteSwapTransaction(result.transaction, wallet.keypair);

        console.log("Transaction executed successfully:", txResult.digest);

        showToast({
          type: "success",
          title: "Transaction Successful!",
          message: successMessage,
          txDigest: txResult.digest,
          duration: 6000,
        });

        onSuccess();
        onClose();
      } catch (error) {
        console.error("Transaction failed:", error);
        const errorMsg = error instanceof Error ? error.message : "Transaction failed";

        showToast({
          type: "error",
          title: "Transaction Failed",
          message: errorMsg,
          duration: 6000,
        });
      } finally {
        setLoading(false);
      }
    },
    [pool.coin, walletAddress, onSuccess, onClose],
  );

  return {
    loading,
    executeTransaction,
  };
}
