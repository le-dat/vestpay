/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";

export function useSwapHistory(address: string, autoRefreshInterval: number = 5000) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!address) return;

    try {
      setLoading(true);
      const { getTransactionHistory } = await import("@/integrations/sui");
      const { SuiClient } = await import("@mysten/sui/client");
      const client = new SuiClient({ url: "https://fullnode.mainnet.sui.io" });
      const res = await getTransactionHistory(client, address, 5);
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchHistory();
      const interval = setInterval(() => {
        fetchHistory();
      }, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [address, fetchHistory, autoRefreshInterval]);

  return {
    history,
    loading,
    fetchHistory,
  };
}
