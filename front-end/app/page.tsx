'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { hasWallet } from '@/lib/sui/passkey';

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && hasWallet()) {
      router.push('/dashboard');
    }
  }, [mounted, router]);

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Passkey Sui Wallet
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Secure Web3 wallet powered by Passkey authentication
          </p>
          <p className="text-gray-500 dark:text-gray-400 mb-12 max-w-xl mx-auto">
            No passwords, no seed phrases. Just your biometric authentication.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/register"
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg"
            >
              🚀 Create Wallet
            </a>
            <a
              href="/login"
              className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-all border-2 border-gray-200 dark:border-gray-700"
            >
              🔓 Login
            </a>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Passkey Security
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your private key never leaves your device. Protected by biometric authentication.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Sui Blockchain
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Built on Sui - the fastest and most scalable blockchain platform.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Cross-Device Sync
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your Passkey syncs across devices via iCloud, Google, or Microsoft.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Register with Email
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Enter your email and create a Passkey using Touch ID, Face ID, or Windows Hello.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Wallet Created Instantly
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Your Sui wallet is generated and secured by your device's Passkey.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Start Using Web3
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  Send and receive SUI tokens securely without managing private keys.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
