import { useState, useEffect } from "react";
import { ScallopMarketData } from "@/lib/types/defi";

export const useScallopMarket = () => {
  const [data, setData] = useState<ScallopMarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("https://sdk.api.scallop.io/api/market/migrate");
      if (!response.ok) {
        throw new Error("Failed to fetch Scallop market data");
      }
      const jsonData = await response.json();
      setData(jsonData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refresh: fetchData };
};
