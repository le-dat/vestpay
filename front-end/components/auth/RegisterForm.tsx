'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPasskeyWallet } from '@/lib/sui/passkey';
import { cacheKeypairInMemory } from '@/lib/sui/keypair-cache';
import { validateEmail } from '@/lib/utils/validation';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const validation = validateEmail(email);
    if (!validation.valid) {
      setError(validation.error || 'Invalid email');
      return;
    }

    setLoading(true);

    try {
      // Create Passkey wallet
      const { keypair, address, publicKey } = await createPasskeyWallet(email);

      // IMPORTANT: Cache keypair in memory for transactions
      cacheKeypairInMemory(keypair);
      
      console.log('✅ Passkey cached successfully for swap transactions');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Register with your email and Passkey
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Wallet...
              </span>
            ) : (
              '🔐 Create Wallet with Passkey'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have a wallet?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Login here
            </a>
          </p>
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            💡 <strong>How it works:</strong> Your private key is securely stored in your device's Passkey (Touch ID, Face ID, or Windows Hello). It never leaves your device!
          </p>
        </div>
      </div>
    </div>
  );
}
