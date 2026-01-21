import type { PasskeyKeypair } from '@mysten/sui/keypairs/passkey';
import { getCachedKeypairFromMemory } from './keypair-cache';
import { recoverPasskeyWallet } from './passkey';

export async function getKeypairForSigning(): Promise<PasskeyKeypair | null> {
  const cached = getCachedKeypairFromMemory();
  if (cached) {
    return cached;
  }

  const recovered = await recoverPasskeyWallet();

  if (!recovered) {
    return null;
  }

  return recovered.keypair;
}
