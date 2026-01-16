import {
  PasskeyKeypair,
  BrowserPasskeyProvider,
  type BrowserPasswordProviderOptions,
} from '@mysten/sui/keypairs/passkey';
import { cacheKeypairInMemory, getCachedKeypairFromMemory } from './keypair-cache';

const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME || 'Passkey Sui Wallet';
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

/**
 * Create a new Passkey wallet
 * This will prompt the user to create a new Passkey credential
 */
export async function createPasskeyWallet(email: string): Promise<{
  keypair: PasskeyKeypair;
  publicKey: string;
  address: string;
}> {
  const provider = new BrowserPasskeyProvider(RP_NAME, {
    rpName: RP_NAME,
    rpId: RP_ID,
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Use device authenticator (Touch ID, Face ID, Windows Hello)
      requireResidentKey: true,
      userVerification: 'required',
    },
  } as BrowserPasswordProviderOptions);

  // Create new passkey wallet
  const keypair = await PasskeyKeypair.getPasskeyInstance(provider);

  const publicKey = keypair.getPublicKey();
  const address = publicKey.toSuiAddress();

  // Cache the keypair in sessionStorage
  cacheKeypair(email, {
    publicKey: publicKey.toBase64(),
    address,
  });

  // Cache keypair in memory for immediate use
  cacheKeypairInMemory(keypair);

  return {
    keypair,
    publicKey: publicKey.toBase64(),
    address,
  };
}

/**
 * Recover existing Passkey wallet
 * Uses signAndRecover to derive public key from 2 signatures
 */
export async function recoverPasskeyWallet(): Promise<{
  keypair: PasskeyKeypair;
  publicKey: string;
  address: string;
} | null> {
  // Check if we have cached keypair first
  const cached = getCachedKeypairFromMemory();
  if (cached) {
    const publicKey = cached.getPublicKey();
    return {
      keypair: cached,
      publicKey: publicKey.toBase64(),
      address: publicKey.toSuiAddress(),
    };
  }

  try {
    const provider = new BrowserPasskeyProvider(RP_NAME, {
      rpName: RP_NAME,
      rpId: RP_ID,
    } as BrowserPasswordProviderOptions);

    // Sign two different messages to recover public key
    const message1 = new TextEncoder().encode('Sui Wallet Recovery Message 1');
    const message2 = new TextEncoder().encode('Sui Wallet Recovery Message 2');

    const possiblePks1 = await PasskeyKeypair.signAndRecover(provider, message1);
    const possiblePks2 = await PasskeyKeypair.signAndRecover(provider, message2);

    // Find common public key
    const commonPk = findCommonPublicKey(possiblePks1, possiblePks2);

    if (!commonPk) {
      throw new Error('Could not recover public key');
    }

    // Reconstruct keypair
    const keypair = new PasskeyKeypair(commonPk.toRawBytes(), provider);
    const address = commonPk.toSuiAddress();

    // Cache for future use
    cacheKeypairInMemory(keypair);

    return {
      keypair,
      publicKey: commonPk.toBase64(),
      address,
    };
  } catch (error) {
    console.error('Failed to recover passkey wallet:', error);
    return null;
  }
}

/**
 * Find common public key from two sets of possible keys
 */
function findCommonPublicKey(
  possiblePks1: any[],
  possiblePks2: any[]
): any | null {
  for (const pk1 of possiblePks1) {
    for (const pk2 of possiblePks2) {
      if (pk1.toBase64() === pk2.toBase64()) {
        return pk1;
      }
    }
  }
  return null;
}

/**
 * Cache wallet info in sessionStorage
 */
export function cacheKeypair(
  email: string,
  walletInfo: { publicKey: string; address: string }
): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('sui_wallet_email', email);
    sessionStorage.setItem('sui_wallet_info', JSON.stringify(walletInfo));
  }
}

/**
 * Get cached wallet info
 */
export function getCachedWalletInfo(): {
  email: string;
  publicKey: string;
  address: string;
} | null {
  if (typeof window === 'undefined') return null;

  const email = sessionStorage.getItem('sui_wallet_email');
  const walletInfoStr = sessionStorage.getItem('sui_wallet_info');

  if (!email || !walletInfoStr) return null;

  try {
    const walletInfo = JSON.parse(walletInfoStr);
    return {
      email,
      ...walletInfo,
    };
  } catch {
    return null;
  }
}

/**
 * Clear cached wallet info (logout)
 */
export function clearWalletCache(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('sui_wallet_email');
    sessionStorage.removeItem('sui_wallet_info');
  }
  // Also clear in-memory keypair cache
  const { clearKeypairCache } = require('./keypair-cache');
  clearKeypairCache();
}

/**
 * Check if user has a cached wallet
 */
export function hasWallet(): boolean {
  return getCachedWalletInfo() !== null;
}
