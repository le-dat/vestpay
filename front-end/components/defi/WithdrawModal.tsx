'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { showToast } from '@/components/common/Toast';
import { LendingPool } from '@/lib/types/defi';
import { formatCurrency } from '@/lib/utils/format';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: LendingPool;
  walletAddress: string;
  suppliedAmount: number;
  onSuccess: () => void;
}

export function WithdrawModal({
  isOpen,
  onClose,
  pool,
  walletAddress,
  suppliedAmount,
  onSuccess,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setStep('input');
      setLoading(false);
    }
  }, [isOpen]);

  const handleMaxClick = () => {
    setAmount(suppliedAmount.toString());
  };

  const handleAmountChange = (value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount to withdraw',
      });
      return;
    }

    if (parseFloat(amount) > suppliedAmount) {
      showToast({
        type: 'error',
        title: 'Insufficient Supply',
        message: `You don't have enough ${pool.coin} supplied to withdraw`,
      });
      return;
    }

    setLoading(true);

    try {
      const { buildWithdrawTransaction } = await import('@/lib/scallop/withdraw');
      const { recoverPasskeyWallet } = await import('@/lib/sui/passkey');
      const { signAndExecuteSwapTransaction } = await import('@/lib/suilend/core/signing');

      const wallet = await recoverPasskeyWallet();
      if (!wallet) {
        throw new Error('Failed to recover wallet. Please login again.');
      }

      console.log('Building withdraw transaction...');
      const withdrawResult = await buildWithdrawTransaction({
        userAddress: walletAddress,
        coinName: pool.coin.toLowerCase(),
        amount: parseFloat(amount),
      });

      console.log('Signing and executing transaction...');
      const result = await signAndExecuteSwapTransaction(
        withdrawResult.transaction,
        wallet.keypair
      );

      console.log('Withdraw executed successfully:', result.digest);

      showToast({
        type: 'success',
        title: 'Withdraw Successful!',
        message: `You have withdrawn ${amount} ${pool.coin}`,
        txDigest: result.digest,
        duration: 6000,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Withdraw failed:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to withdraw';
      showToast({
        type: 'error',
        title: 'Withdraw Failed',
        message: errorMsg,
        duration: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Image
                src={pool.icon}
                alt={pool.coin}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold text-gray-900">Withdraw {pool.coin}</h2>
                <p className="text-sm text-gray-500">
                  Available: {suppliedAmount.toFixed(4)} {pool.coin}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {step === 'input' ? (
              <>
                {/* Amount Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 font-medium">Amount</span>
                    <span className="text-gray-500">
                      Supplied: {suppliedAmount.toFixed(4)} {pool.coin}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => handleAmountChange(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-4 pr-20 text-2xl font-bold bg-gray-50 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-primary transition-colors"
                    />
                    <button
                      onClick={handleMaxClick}
                      className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      MAX
                    </button>
                  </div>
                  {amount && (
                    <p className="text-sm text-gray-500">
                      ≈ {formatCurrency(parseFloat(amount) * pool.price)} USD
                    </p>
                  )}
                </div>

                {/* Info Cards */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Current APY</span>
                    <span className="font-bold text-emerald-600">{pool.apy}%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600 font-medium">Remaining After Withdraw</span>
                    <span className="font-bold text-gray-900">
                      {Math.max(0, suppliedAmount - (parseFloat(amount) || 0)).toFixed(4)} {pool.coin}
                    </span>
                  </div>
                </div>

                {/* Withdraw Button */}
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > suppliedAmount}
                  className="w-full py-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                {/* Confirmation View */}
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">You're withdrawing</span>
                      <span className="font-bold text-gray-900">
                        {amount} {pool.coin}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Value</span>
                      <span className="font-bold text-gray-900">
                        ≈ {formatCurrency(parseFloat(amount) * pool.price)} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Remaining Supply</span>
                      <span className="font-bold text-gray-900">
                        {Math.max(0, suppliedAmount - parseFloat(amount)).toFixed(4)} {pool.coin}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      Your sCoin tokens will be burned and you'll receive {pool.coin} back to your wallet.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('input')}
                    disabled={loading}
                    className="flex-1 py-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={loading}
                    className="flex-1 py-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Confirming...
                      </>
                    ) : (
                      'Confirm Withdraw'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
