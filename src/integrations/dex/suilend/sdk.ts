import { SuilendClient, LENDING_MARKET_ID, LENDING_MARKET_TYPE } from '@suilend/sdk';
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';

let suilendInstance: SuilendClient | null = null;
export const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

export const getSuilendSdk = async (): Promise<SuilendClient> => {
  if (!suilendInstance) {
    suilendInstance = await SuilendClient.initialize(
      LENDING_MARKET_ID,
      LENDING_MARKET_TYPE,
      client
    );
  }
  return suilendInstance;
};

export const createTimeout = (ms: number) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Transaction build timeout')), ms),
  );
};
