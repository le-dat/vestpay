import {
  PasskeyKeypair,
  BrowserPasskeyProvider,
  type BrowserPasswordProviderOptions,
} from '@mysten/sui/keypairs/passkey';
import { cacheKeypairInMemory, getCachedKeypairFromMemory } from './keypair-cache';
import { clearKeypairCache } from './keypair-cache';

const RP_NAME = process.env.NEXT_PUBLIC_RP_NAME || 'Passkey Sui Wallet';
const RP_ID = process.env.NEXT_PUBLIC_RP_ID || 'localhost';

export async function createPasskeyWallet(email: string): Promise<{
  keypair: PasskeyKeypair;
  publicKey: string;
  address: string;
}> {
  const provider = new BrowserPasskeyProvider(RP_NAME, {
    rpName: RP_NAME,
    rpId: RP_ID,
    authenticatorSelection: {
      authenticatorAttachment: 'cross-platform', // Use device authenticator (Touch ID, Face ID, Windows Hello)
      requireResidentKey: true,
      userVerification: 'required',
    },
  } as BrowserPasswordProviderOptions);

  const keypair = await PasskeyKeypair.getPasskeyInstance(provider);

  const publicKey = keypair.getPublicKey();
  const address = publicKey.toSuiAddress();

  cacheKeypair(email, {
    publicKey: publicKey.toBase64(),
    address,
  });

  cacheKeypairInMemory(keypair);

  storePublicKeyPersistently(email, publicKey.toBase64(), address);

  return {
    keypair,
    publicKey: publicKey.toBase64(),
    address,
  };
}

export async function recoverPasskeyWallet(): Promise<{
  keypair: PasskeyKeypair;
  publicKey: string;
  address: string;
} | null> {
  const cached = getCachedKeypairFromMemory();
  if (cached) {
    const publicKey = cached.getPublicKey();
    return {
      keypair: cached,
      publicKey: publicKey.toBase64(),
      address: publicKey.toSuiAddress(),
    };
  }

  const storedWallet = getStoredPublicKey();
  if (storedWallet) {
    try {
      const provider = new BrowserPasskeyProvider(RP_NAME, {
        rpName: RP_NAME,
        rpId: RP_ID,
        authenticatorSelection: {
          authenticatorAttachment: 'cross-platform',
          requireResidentKey: true,
          userVerification: 'required',
        },
      } as BrowserPasswordProviderOptions);

      const testMessage = new TextEncoder().encode('Sui Wallet Login');
      const possiblePks = await PasskeyKeypair.signAndRecover(provider, testMessage);

      const matchedPk = possiblePks.find(pk => pk.toBase64() === storedWallet.publicKey);

      if (!matchedPk) {
        throw new Error('Stored public key does not match passkey');
      }

      const keypair = new PasskeyKeypair(matchedPk.toRawBytes(), provider);

      cacheKeypairInMemory(keypair);

      return {
        keypair,
        publicKey: storedWallet.publicKey,
        address: storedWallet.address,
      };
    } catch (error) {
      console.error('Failed to recover with stored key, falling back to double-signature:', error);
    }
  }

  try {
    const provider = new BrowserPasskeyProvider(RP_NAME, {
      rpName: RP_NAME,
      rpId: RP_ID,
      authenticatorSelection: {
        authenticatorAttachment: 'cross-platform',
        requireResidentKey: true,
        userVerification: 'required',
      },
    } as BrowserPasswordProviderOptions);

    const message1 = new TextEncoder().encode('Sui Wallet Recovery Message 1');
    const message2 = new TextEncoder().encode('Sui Wallet Recovery Message 2');

    const possiblePks1 = await PasskeyKeypair.signAndRecover(provider, message1);
    const possiblePks2 = await PasskeyKeypair.signAndRecover(provider, message2);

    const commonPk = findCommonPublicKey(possiblePks1, possiblePks2);

    if (!commonPk) {
      throw new Error('Could not recover public key');
    }

    const keypair = new PasskeyKeypair(commonPk.toRawBytes(), provider);
    const address = commonPk.toSuiAddress();

    const email = sessionStorage.getItem('sui_wallet_email') || 'unknown';
    storePublicKeyPersistently(email, commonPk.toBase64(), address);

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
 * Store public key persistently in localStorage
 * Public keys are NOT SECRET per WebAuthn standards
 */
export function storePublicKeyPersistently(
  email: string,
  publicKey: string,
  address: string
): void {
  if (typeof window !== 'undefined') {
    const walletData = {
      email,
      publicKey,
      address,
      timestamp: Date.now(),
    };
    localStorage.setItem('sui_passkey_wallet', JSON.stringify(walletData));
  }
}

/**
 * Get stored public key from localStorage
 */
function getStoredPublicKey(): {
  email: string;
  publicKey: string;
  address: string;
} | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem('sui_passkey_wallet');
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
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
    localStorage.removeItem('sui_passkey_wallet');
  }
  clearKeypairCache();
}

/**
 * Check if user has a cached wallet
 */
export function hasWallet(): boolean {
  return getCachedWalletInfo() !== null;
}
