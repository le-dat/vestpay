export const formatNumber = (num: number, decimals: number = 2): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(decimals)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(decimals)}K`;
  }
  return num.toFixed(decimals);
};

export const formatCurrency = (num: number): string => {
  return `$${formatNumber(num)}`;
};

/**
 * Format coin balance to a fixed number of decimal places
 */
export function formatCoinBalance(balance: string | number, decimals: number = 4): string {
  const num = typeof balance === "string" ? parseFloat(balance) : balance;
  return num.toFixed(decimals);
}
