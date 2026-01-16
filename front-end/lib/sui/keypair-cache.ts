import type { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';

// In-memory cache for the current session
let cachedKeypair: PasskeyKeypair | null = null;

/**
 * Cache keypair in memory for the session
 */
export function cacheKeypairInMemory(keypair: PasskeyKeypair): void {
  cachedKeypair = keypair;
}

/**
 * Get cached keypair from memory
 */
export function getCachedKeypairFromMemory(): PasskeyKeypair | null {
  return cachedKeypair;
}

/**
 * Clear cached keypair
 */
export function clearKeypairCache(): void {
  cachedKeypair = null;
}
