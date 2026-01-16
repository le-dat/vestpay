import type { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';
import { getCachedKeypairFromMemory } from './keypair-cache';
import { recoverPasskeyWallet } from './passkey';

/**
 * Get keypair for signing - checks cache first, recovers if needed
 * This minimizes Passkey prompts
 */
export async function getKeypairForSigning(): Promise<PasskeyKeypair | null> {
  // Check cache first
  const cached = getCachedKeypairFromMemory();
  if (cached) {
    return cached;
  }

  // Cache miss - need to recover
  const recovered = await recoverPasskeyWallet();

  if (!recovered) {
    return null;
  }

  return recovered.keypair;
}
