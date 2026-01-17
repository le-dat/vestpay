import type { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';
import { getCachedKeypairFromMemory } from './keypair-cache';
import { recoverPasskeyWallet } from './passkey';
import {
  setPasskeySession,
  updateLastAuth,
  isRecentlyAuthenticated,
} from './passkey-cache';

/**
 * Get keypair for signing - checks cache first, recovers if needed
 * This minimizes Passkey prompts
 */
export async function getKeypairForSigning(): Promise<PasskeyKeypair | null> {
  // Check cache first
  const cached = getCachedKeypairFromMemory();
  if (cached) {
    // Update session timestamp
    const address = cached.getPublicKey().toSuiAddress();
    setPasskeySession(address);
    return cached;
  }

  // Cache miss - need to recover (triggers passkey)
  const recovered = await recoverPasskeyWallet();

  if (!recovered) {
    return null;
  }

  // Set session after successful recovery
  const address = recovered.keypair.getPublicKey().toSuiAddress();
  setPasskeySession(address);
  updateLastAuth();

  return recovered.keypair;
}

/**
 * Check if user is recently authenticated
 * Use this to show UI hints about cached auth
 */
export { isRecentlyAuthenticated, updateLastAuth };
