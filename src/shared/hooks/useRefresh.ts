'use client'
import { useState, useCallback } from "react";

interface UseRefreshOptions {
  delay?: number;
}

/**
 * Hook to handle refresh operations with loading state and delay
 */
export function useRefresh(
  refreshFn: () => Promise<void> | void,
  options: UseRefreshOptions = {}
) {
  const { delay = 500 } = options;
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshFn();
    } finally {
      setTimeout(() => setRefreshing(false), delay);
    }
  }, [refreshFn, delay]);

  return {
    refreshing,
    handleRefresh,
  };
}
