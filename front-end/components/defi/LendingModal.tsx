'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { showToast } from '@/components/common/Toast';
import { LendingPool, LendingModalConfig } from '@/lib/types/defi';
import { formatCurrency } from '@/lib/utils/format';
import { useModalState, useLendingTransaction } from './hooks';

interface LendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: LendingPool;
  walletAddress: string;
  onSuccess: () => void;
  config: LendingModalConfig;
}

export function LendingModal({
  isOpen,
  onClose,
  pool,
  walletAddress,
  onSuccess,
  config,
}: LendingModalProps) {
  const { amount, step, setStep, handleAmountChange, handleMaxClick } = useModalState(isOpen);
  const { loading, executeTransaction } = useLendingTransaction({
    pool,
    walletAddress,
    onSuccess,
    onClose,
  });

  const estimatedYield = () => {
    if (config.type !== 'supply') return null;
    const amountNum = parseFloat(amount) || 0;
    const yearlyYield = amountNum * (pool.apy / 100);
    return yearlyYield.toFixed(4);
  };

  const handleContinue = () => {
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      showToast({
        type: 'error',
        title: 'Invalid Amount',
        message: `Please enter a valid amount to ${config.type}`,
      });
      return;
    }

    if (amountNum > config.maxAmount) {
      showToast({
        type: 'error',
        title: config.type === 'supply' ? 'Insufficient Balance' : 'Insufficient Supply',
        message: `You don't have enough ${pool.coin} to ${config.type}`,
      });
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount);
    await executeTransaction(
      amountNum,
      config.buildTransaction,
      config.successMessage.replace('{amount}', amount).replace('{coin}', pool.coin)
    );
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
                <h2 className="text-xl font-bold text-gray-900">
                  {config.title} {pool.coin}
                </h2>
                <p className="text-sm text-gray-500">
                  {config.type === 'supply'
                    ? `Earn ${pool.apy}% APY`
                    : `${config.maxAmountLabel}: ${config.maxAmount.toFixed(4)} ${pool.coin}`
                  }
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
                      {config.maxAmountLabel}: {config.maxAmount.toFixed(4)} {pool.coin}
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
                      onClick={() => handleMaxClick(config.maxAmount)}
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
                  {config.type === 'supply' ? (
                    <>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium">Supply APY</span>
                        <span className="font-bold text-emerald-600">{pool.apy}%</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium">Est. Yearly Yield</span>
                        <span className="font-bold text-gray-900">
                          {estimatedYield()} {pool.coin}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium">Utilization Rate</span>
                        <span className="font-bold text-gray-900">{pool.utilizationRate}%</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium">Current APY</span>
                        <span className="font-bold text-emerald-600">{pool.apy}%</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <span className="text-gray-600 font-medium">Remaining After Withdraw</span>
                        <span className="font-bold text-gray-900">
                          {Math.max(0, config.maxAmount - (parseFloat(amount) || 0)).toFixed(4)} {pool.coin}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > config.maxAmount}
                  className={`w-full py-4 font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${config.type === 'supply'
                      ? 'bg-gradient-to-r from-[#00d084] to-[#00a569] hover:from-[#00c07a] hover:to-[#009557] text-white shadow-[#00d084]/20'
                      : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white'
                    }`}
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
                      <span className="text-gray-600">You're {config.type}ing</span>
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
                    {config.type === 'supply' ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">APY</span>
                          <span className="font-bold text-emerald-600">{pool.apy}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Est. Yearly Yield</span>
                          <span className="font-bold text-emerald-600">
                            {estimatedYield()} {pool.coin}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Remaining Supply</span>
                        <span className="font-bold text-gray-900">
                          {Math.max(0, config.maxAmount - parseFloat(amount)).toFixed(4)} {pool.coin}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`p-4 border rounded-xl ${config.type === 'supply'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-blue-50 border-blue-200'
                    }`}>
                    <p className={`text-sm ${config.type === 'supply' ? 'text-amber-800' : 'text-blue-800'
                      }`}>
                      {config.type === 'supply'
                        ? `By supplying ${pool.coin}, you'll receive sCoin tokens representing your deposit. You can withdraw your assets anytime.`
                        : `Your sCoin tokens will be burned and you'll receive ${pool.coin} back to your wallet.`
                      }
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
                    onClick={handleConfirm}
                    disabled={loading}
                    className={`flex-1 py-4 font-bold text-lg rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${config.type === 'supply'
                        ? 'bg-gradient-to-r from-[#00d084] to-[#00a569] hover:from-[#00c07a] hover:to-[#009557] text-white shadow-[#00d084]/20'
                        : 'bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white'
                      }`}
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
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Confirming...
                      </>
                    ) : (
                      `Confirm ${config.actionLabel}`
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
