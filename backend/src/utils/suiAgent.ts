import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { fromB64 } from '@mysten/sui.js/utils';

export interface SuiAgentResult {
  client: SuiClient;
  keypair: Ed25519Keypair;
  address: string;
}

export class SuiAgent {
  private static client: SuiClient;

  static getClient(network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet'): SuiClient {
    if (!this.client) {
      this.client = new SuiClient({ url: getFullnodeUrl(network) });
    }
    return this.client;
  }

  static async getAgentByPrivateKey(privateKey: string, network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet'): Promise<SuiAgentResult> {
    try {
      // Convert base64 private key to keypair
      const keypair = Ed25519Keypair.fromSecretKey(fromB64(privateKey));
      const address = keypair.getPublicKey().toSuiAddress();
      const client = this.getClient(network);

      return {
        client,
        keypair,
        address,
      };
    } catch (error) {
      throw new Error(
        `Failed to create Sui agent: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  static async getAgentByAddress(userAddress: string, network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet'): Promise<{ client: SuiClient; address: string }> {
    const client = this.getClient(network);
    return {
      client,
      address: userAddress,
    };
  }
}

export async function suiAgent(
  userAddress: string,
  network: 'mainnet' | 'testnet' | 'devnet' = 'mainnet',
): Promise<{ client: SuiClient; address: string }> {
  return SuiAgent.getAgentByAddress(userAddress, network);
}
