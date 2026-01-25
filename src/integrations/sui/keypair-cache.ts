import type { PasskeyKeypair } from "@mysten/sui/keypairs/passkey";

let cachedKeypair: PasskeyKeypair | null = null;

export function cacheKeypairInMemory(keypair: PasskeyKeypair): void {
  cachedKeypair = keypair;
}

export function getCachedKeypairFromMemory(): PasskeyKeypair | null {
  return cachedKeypair;
}

export function clearKeypairCache(): void {
  cachedKeypair = null;
}
