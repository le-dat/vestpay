import { useMemo } from "react";
import { ScallopMarketData } from "@/features/lending";

interface Coin {
  coinType: string;
  symbol: string;
  balanceFormatted: string;
}

export function useCoinValues(coins: Coin[], marketData?: ScallopMarketData) {
  return useMemo(() => {
    if (!marketData?.pools || coins.length === 0) {
      return {};
    }

    const values: Record<string, number> = {};

    coins.forEach((coin) => {
      const pool = marketData.pools.find(
        (p) =>
          p.coinType === coin.coinType ||
          p.sCoinType === coin.coinType ||
          p.symbol.toUpperCase() === coin.symbol.toUpperCase(),
      );

      let price = pool?.coinPrice || 0;

      if (pool && pool.sCoinType === coin.coinType) {
        price = price * (pool.conversionRate || 1);
      }

      const balance = parseFloat(coin.balanceFormatted);
      const value = balance * price;

      values[coin.symbol] = value;
    });

    return values;
  }, [coins, marketData]);
}
