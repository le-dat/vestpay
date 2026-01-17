/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

let scallopInstance: Scallop | null = null;
export const client = new SuiClient({ url: getFullnodeUrl('mainnet') });

export const getScallopSdk = async (): Promise<Scallop> => {
  if (!scallopInstance) {
    scallopInstance = new Scallop({
      networkType: 'mainnet',
    });
    await scallopInstance.init();
  }
  return scallopInstance;
};

export const createTimeout = (ms: number) => {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Transaction build timeout')), ms),
  );
};
