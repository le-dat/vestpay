import { SuiClient } from '@mysten/sui/client';

export interface CoinBalance {
  coinType: string;
  coinObjectCount: number;
  totalBalance: string;
  lockedBalance: string;
}

export interface CoinMetadata {
  decimals: number;
  name: string;
  symbol: string;
  description: string;
  iconUrl?: string;
}

export interface FormattedCoinBalance {
  coinType: string;
  symbol: string;
  name: string;
  balance: string;
  balanceFormatted: string;
  decimals: number;
  iconUrl?: string;
  usdValue?: number;
}

/**
 * Get all coins owned by an address
 */
export async function getAllCoins(
  client: SuiClient,
  address: string
): Promise<CoinBalance[]> {
  try {
    const result = await client.getAllBalances({
      owner: address,
    });
    return result;
  } catch (error) {
    console.error('Failed to get all coins:', error);
    return [];
  }
}

/**
 * Get metadata for a specific coin type
 */
export async function getCoinMetadata(
  client: SuiClient,
  coinType: string
): Promise<CoinMetadata | null> {
  try {
    const metadata = await client.getCoinMetadata({ coinType });
    if (!metadata) return null;

    return {
      decimals: metadata.decimals,
      name: metadata.name,
      symbol: metadata.symbol,
      description: metadata.description,
      iconUrl: metadata.iconUrl || undefined,
    };
  } catch (error) {
    console.error(`Failed to get metadata for ${coinType}:`, error);
    return null;
  }
}

/**
 * Format coin balance with metadata
 */
export async function getFormattedCoinBalances(
  client: SuiClient,
  address: string
): Promise<FormattedCoinBalance[]> {
  const coins = await getAllCoins(client, address);

  const formatted = await Promise.all(
    coins.map(async (coin) => {
      const metadata = await getCoinMetadata(client, coin.coinType);

      const decimals = metadata?.decimals || 9;
      const rawBalance = BigInt(coin.totalBalance);
      const divisor = BigInt(10 ** decimals);
      const balance = Number(rawBalance) / Number(divisor);

      return {
        coinType: coin.coinType,
        symbol: metadata?.symbol || 'Unknown',
        name: metadata?.name || 'Unknown Token',
        balance: coin.totalBalance,
        balanceFormatted: balance.toFixed(decimals),
        decimals,
        iconUrl: metadata?.iconUrl,
      };
    })
  );

  return formatted;
}

/**
 * Format balance from raw amount
 */
export function formatBalance(
  rawBalance: string | bigint,
  decimals: number = 9
): string {
  const balance = BigInt(rawBalance);
  const divisor = BigInt(10 ** decimals);
  const whole = balance / divisor;
  const remainder = balance % divisor;

  if (remainder === BigInt(0)) {
    return whole.toString();
  }

  const fractional = remainder.toString().padStart(decimals, '0');
  const trimmed = fractional.replace(/0+$/, '');

  return `${whole}.${trimmed}`;
}

/**
 * Parse formatted balance to raw amount
 */
export function parseBalance(
  formattedBalance: string,
  decimals: number = 9
): bigint {
  const [whole, fractional = ''] = formattedBalance.split('.');
  const paddedFractional = fractional.padEnd(decimals, '0').slice(0, decimals);
  const rawAmount = whole + paddedFractional;
  return BigInt(rawAmount);
}

/**
 * Get total portfolio value in USD (placeholder for future price API integration)
 */
export async function getPortfolioValue(
  client: SuiClient,
  address: string
): Promise<number> {
  // TODO: Integrate with price API (CoinGecko, etc.)
  // For now, return 0
  return 0;
}
