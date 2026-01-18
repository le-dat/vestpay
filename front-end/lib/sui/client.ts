import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

const NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet') as 'testnet' | 'devnet' | 'mainnet';

export function getSuiClient(): SuiClient {
  return new SuiClient({ url: getFullnodeUrl(NETWORK) });
}

export async function getWalletBalance(address: string): Promise<string> {
  try {
    const client = getSuiClient();
    const balance = await client.getBalance({
      owner: address,
    });

    // Convert from MIST to SUI (1 SUI = 10^9 MIST)
    const suiBalance = (BigInt(balance.totalBalance) / BigInt(1_000_000_000)).toString();
    return suiBalance;
  } catch (error) {
    console.error('Failed to get balance:', error);
    return '0';
  }
}

export async function getWalletObjects(address: string): Promise<any[]> {
  try {
    const client = getSuiClient();
    const objects = await client.getOwnedObjects({
      owner: address,
    });
    return objects.data;
  } catch (error) {
    console.error('Failed to get objects:', error);
    return [];
  }
}

export function getExplorerUrl(address: string, network: 'testnet' | 'devnet' | 'mainnet' = 'testnet'): string {
  const baseUrl = network === 'mainnet'
    ? 'https://suiscan.xyz/mainnet'
    : `https://suiscan.xyz/${network}`;
  return `${baseUrl}/account/${address}`;
}
