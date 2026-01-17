'use client';

import { useState } from 'react';
import { useNetwork } from '@/lib/context/NetworkContext';
import { getKeypairForSigning, isRecentlyAuthenticated, updateLastAuth } from '@/lib/sui/signing';
import { getCachedWalletInfo } from '@/lib/sui/passkey';
import { buildDepositTransaction, buildSupplyAsCollateralTransaction } from '@/lib/scallop/client';
import AuthStatusIndicator from './AuthStatusIndicator';

interface ScallopSupplyProps {
  onSuccess?: () => void;
}

interface SupplyResult {
  txBytes: string; // Base64 encoded transaction bytes
  apy: number;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
    utilizationRate: number;
  };
}

export default function ScallopSupply({ onSuccess }: ScallopSupplyProps) {
  const { client, network } = useNetwork();
  const [coinName, setCoinName] = useState('sui');
  const [amount, setAmount] = useState('');
  const [depositType, setDepositType] = useState<'simple' | 'collateral'>('collateral');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [txDigest, setTxDigest] = useState('');
  const [marketInfo, setMarketInfo] = useState<SupplyResult['marketInfo'] | null>(null);

  const handleSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setTxDigest('');
    setMarketInfo(null);

    // Validation
    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    // Scallop minimum deposit check
    if (amountNum < 0.1) {
      setError('Minimum deposit is 0.1 SUI. Please enter a larger amount.');
      return;
    }

    setLoading(true);

    try {
      // Get wallet info
      const walletInfo = getCachedWalletInfo();
      if (!walletInfo) {
        setError('Wallet not found. Please login again.');
        setLoading(false);
        return;
      }

      // Convert to MIST (smallest unit)
      const amountInMist = Math.floor(parseFloat(amount) * 1_000_000_000);

      console.log('Building supply as collateral transaction:', {
        userAddress: walletInfo.address,
        coinName,
        amount: amountInMist,
        originalAmount: amount,
      });

      // Step 1: Build transaction based on deposit type
      let transaction;
      let info;

      if (depositType === 'simple') {
        console.log('📦 Building simple deposit (will receive sSUI)');
        const result = await buildDepositTransaction(
          walletInfo.address,
          coinName,
          amountInMist,
        );
        transaction = result.transaction;
        info = result.marketInfo;
      } else {
        console.log('🔒 Building collateral deposit (enables borrowing)');
        const result = await buildSupplyAsCollateralTransaction(
          walletInfo.address,
          coinName,
          amountInMist,
        );
        transaction = result.transaction;
        info = result.marketInfo;
      }

      // Store market info for display
      setMarketInfo(info);

      // Step 2: Get keypair for signing (triggers Passkey ONCE)
      const wallet = await getKeypairForSigning();
      if (!wallet) {
        setError('Failed to access wallet. Please try again.');
        setLoading(false);
        return;
      }

      // Step 3: Sign and execute
      const recentAuth = isRecentlyAuthenticated(30000);
      if (recentAuth) {
        console.log('✅ Using cached authentication - no passkey prompt needed');
      }

      const result = await client.signAndExecuteTransaction({
        signer: wallet,
        transaction,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      if (result.effects?.status?.status === 'success') {
        setSuccess('Supply successful!');
        setTxDigest(result.digest);
        setAmount('');

        // Update auth timestamp after successful transaction
        updateLastAuth();

        // Store obligation ID and key if created
        if (depositType === 'collateral') {
          // Method 1: Parse from events (most reliable)
          if (result.events) {
            const obligationEvent = result.events.find(
              (event) => event.type.includes('ObligationCreatedEvent')
            );

            if (obligationEvent && obligationEvent.parsedJson) {
              const eventData = obligationEvent.parsedJson as {
                obligation?: string;
                obligation_key?: string;
              };

              if (eventData.obligation) {
                console.log('✅ Obligation created (from event):', eventData.obligation);
                localStorage.setItem(
                  `scallop_obligation_${walletInfo.address}`,
                  eventData.obligation
                );
              }

              if (eventData.obligation_key) {
                console.log('✅ Obligation Key created (from event):', eventData.obligation_key);
                localStorage.setItem(
                  `scallop_obligation_key_${walletInfo.address}`,
                  eventData.obligation_key
                );
              }
            }
          }

          // Method 2: Fallback to object changes
          if (result.objectChanges) {
            const obligationObj = result.objectChanges.find(
              (change) => change.type === 'created' && change.objectType?.includes('Obligation') && !change.objectType?.includes('ObligationKey')
            );
            const obligationKeyObj = result.objectChanges.find(
              (change) => change.type === 'created' && change.objectType?.includes('ObligationKey')
            );

            if (obligationObj && 'objectId' in obligationObj) {
              const existingId = localStorage.getItem(`scallop_obligation_${walletInfo.address}`);
              if (!existingId) {
                console.log('✅ Obligation created (from objectChanges):', obligationObj.objectId);
                localStorage.setItem(
                  `scallop_obligation_${walletInfo.address}`,
                  obligationObj.objectId
                );
              }
            }

            if (obligationKeyObj && 'objectId' in obligationKeyObj) {
              const existingKey = localStorage.getItem(`scallop_obligation_key_${walletInfo.address}`);
              if (!existingKey) {
                console.log('✅ Obligation Key created (from objectChanges):', obligationKeyObj.objectId);
                localStorage.setItem(
                  `scallop_obligation_key_${walletInfo.address}`,
                  obligationKeyObj.objectId
                );
              }
            }
          }
        }

        if (onSuccess) onSuccess();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (err) {
      console.error('Supply error:', err);
      setError(err instanceof Error ? err.message : 'Failed to supply tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4">
          <span className="text-2xl">💰</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Scallop Supply
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Earn interest on your crypto
          </p>
        </div>
      </div>

      {/* Auth Status Indicator */}
      <div className="mb-4">
        <AuthStatusIndicator />
      </div>

      {/* Network Warning */}
      {network !== 'mainnet' && (
        <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
          <div className="flex items-start">
            <span className="text-xl mr-2">⚠️</span>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">Mainnet Required</p>
              <p>Scallop Protocol is only available on <strong>Mainnet</strong>. Please switch network above to use this feature.</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSupply} className="space-y-4">
        {/* Coin Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Coin
          </label>
          <select
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="sui">SUI</option>
            <option value="usdc">USDC</option>
            <option value="usdt">USDT</option>
            <option value="weth">WETH</option>
          </select>
        </div>

        {/* Deposit Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Deposit Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDepositType('simple')}
              className={`p-3 rounded-xl border-2 transition-all ${depositType === 'simple'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
            >
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">📦 Simple</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Receive sSUI tokens
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setDepositType('collateral')}
              className={`p-3 rounded-xl border-2 transition-all ${depositType === 'collateral'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
            >
              <div className="text-left">
                <div className="font-semibold text-gray-900 dark:text-white">🔒 Collateral</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Enable borrowing
                </div>
              </div>
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {depositType === 'simple'
              ? '✅ You will receive sSUI tokens that can be traded or used in DeFi'
              : '✅ Deposit as collateral to borrow other assets (no sSUI tokens)'}
          </p>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ({coinName.toUpperCase()})
          </label>
          <input
            type="number"
            step="0.01"
            min="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.1"
            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Minimum: 0.1 {coinName.toUpperCase()} • Enter amount (e.g., 1.5)
          </p>
        </div>

        {/* Market Info Display */}
        {marketInfo && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-semibold text-green-900 dark:text-green-100 mb-3">
              📊 Market Information
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-green-700 dark:text-green-300">Supply APY</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {marketInfo.supplyApy.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 dark:text-green-300">Borrow APY</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {marketInfo.borrowApy.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-green-700 dark:text-green-300">Utilization</p>
                <p className="text-lg font-bold text-green-900 dark:text-green-100">
                  {(marketInfo.utilizationRate * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-2">
              {success}
            </p>
            {txDigest && (
              <a
                href={`https://suiscan.xyz/testnet/tx/${txDigest}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-green-600 dark:text-green-400 hover:underline break-all"
              >
                View on Explorer: {txDigest.slice(0, 20)}...
              </a>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || network !== 'mainnet'}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              <span className="mr-2">💰</span>
              Supply to Scallop
            </>
          )}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start">
          <span className="text-lg mr-2">💡</span>
          <div className="text-xs text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">How it works:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Backend builds transaction payload</li>
              <li>You sign with Passkey (Touch ID/Face ID)</li>
              <li>Transaction executes on Sui blockchain</li>
              <li>Start earning interest immediately!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
