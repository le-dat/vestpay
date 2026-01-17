import {
  PasskeyKeypair,
  BrowserPasskeyProvider,
  type BrowserPasswordProviderOptions,
} from '@mysten/sui/keypairs/passkey';
import {
  cacheKeypairInMemory,
  getCachedKeypairFromMemory,
  clearKeypairCache,
} from './keypair-cache';

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
      authenticatorAttachment: 'platform', // Use device authenticator (Touch ID, Face ID, Windows Hello)
      requireResidentKey: true,
      userVerification: 'required',
    },
  } as BrowserPasswordProviderOptions);

  // Create new passkey wallet
  const keypair = await PasskeyKeypair.getPasskeyInstance(provider);

  const publicKey = keypair.getPublicKey();
  const address = publicKey.toSuiAddress();

  // Get credential ID from provider for future authentication (if available)
  const credentialId: string | null = null; // Note: PasskeyKeypair doesn't expose credentialId in current SDK version

  // Cache the keypair in sessionStorage with credential ID
  cacheKeypair(email, {
    publicKey: publicKey.toBase64(),
    address,
    credentialId,
  });

  // Cache keypair in memory for immediate use
  cacheKeypairInMemory(keypair);

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
  // Check if we have cached keypair first (no prompt needed!)
  const cached = getCachedKeypairFromMemory();
  if (cached) {
    console.log('✅ Using cached keypair - no passkey prompt!');
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

    // Full recovery with 2 signatures (required by Passkey spec)
    console.log('🔐 Recovering wallet - this requires 2 passkey prompts');
    const message1 = new TextEncoder().encode('Sui Wallet Recovery Message 1');
    const message2 = new TextEncoder().encode('Sui Wallet Recovery Message 2');

    console.log('📝 Prompt 1/2: Signing first recovery message...');
    const possiblePks1 = await PasskeyKeypair.signAndRecover(provider, message1);

    console.log('📝 Prompt 2/2: Signing second recovery message...');
    const possiblePks2 = await PasskeyKeypair.signAndRecover(provider, message2);

    // Find common public key
    const commonPk = findCommonPublicKey(possiblePks1, possiblePks2);

    if (!commonPk) {
      throw new Error('Could not recover public key');
    }

    // Reconstruct keypair
    const keypair = new PasskeyKeypair(commonPk.toRawBytes(), provider);
    const address = commonPk.toSuiAddress();

    // Cache for future use (this prevents future prompts!)
    console.log('✅ Recovery successful! Caching keypair...');
    cacheKeypairInMemory(keypair);

    // Update session storage
    const cachedEmail = sessionStorage.getItem('sui_wallet_email');
    if (cachedEmail) {
      cacheKeypair(cachedEmail, {
        publicKey: commonPk.toBase64(),
        address,
      });
    }

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
 * Public key interface for type safety
 */
interface PublicKeyLike {
  toBase64(): string;
  toRawBytes(): Uint8Array;
  toSuiAddress(): string;
}

/**
 * Find common public key from two sets of possible keys
 */
function findCommonPublicKey(
  possiblePks1: PublicKeyLike[],
  possiblePks2: PublicKeyLike[]
): PublicKeyLike | null {
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
  walletInfo: { publicKey: string; address: string; credentialId?: string | null }
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
  credentialId?: string | null;
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
  clearKeypairCache();
}

/**
 * Check if user has a cached wallet
 */
export function hasWallet(): boolean {
  return getCachedWalletInfo() !== null;
}
