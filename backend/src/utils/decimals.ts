export function calculateAmountBeforeDecimals(
  amount: string,
  decimals: number,
): number {
  const numAmount = parseFloat(amount);
  return Math.floor(numAmount * Math.pow(10, decimals));
}

export function calculateAmountAfterDecimals(
  amount: string | number,
  decimals: number,
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return (numAmount / Math.pow(10, decimals)).toString();
}
