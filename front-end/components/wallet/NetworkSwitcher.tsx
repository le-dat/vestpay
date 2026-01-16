'use client';

import { useNetwork } from '@/lib/context/NetworkContext';

export default function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();

  const networks = [
    { value: 'testnet', label: 'Testnet', color: 'bg-green-500' },
    { value: 'devnet', label: 'Devnet', color: 'bg-yellow-500' },
    { value: 'mainnet', label: 'Mainnet', color: 'bg-red-500' },
  ] as const;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Network
      </label>
      <div className="flex gap-2">
        {networks.map((net) => (
          <button
            key={net.value}
            onClick={() => setNetwork(net.value)}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${network === net.value
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <span className={`w-2 h-2 rounded-full ${net.color}`}></span>
              {net.label}
            </div>
          </button>
        ))}
      </div>
      {network === 'mainnet' && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          ⚠️ Warning: You are on Mainnet. Real funds at risk!
        </p>
      )}
    </div>
  );
}
