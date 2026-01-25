"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { showToast } from "@/shared/components/feedback";
import { LendingPool, LendingModalConfig } from "@/features/lending";
import { useModalState, useLendingTransaction } from "../hooks";
import { LendingInputStep } from "./LendingInputStep";
import { LendingConfirmStep } from "./LendingConfirmStep";

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
    if (config.type !== "supply") return null;
    const amountNum = parseFloat(amount) || 0;
    const yearlyYield = amountNum * (pool.apy / 100);
    return yearlyYield.toFixed(3);
  };

  const handleContinue = () => {
    const amountNum = parseFloat(amount);

    if (!amount || amountNum <= 0) {
      showToast({
        type: "error",
        title: "Invalid Amount",
        message: `Please enter a valid amount to ${config.type}`,
      });
      return;
    }

    if (amountNum > config.maxAmount) {
      showToast({
        type: "error",
        title: config.type === "supply" ? "Insufficient Balance" : "Insufficient Supply",
        message: `You don't have enough ${pool.coin} to ${config.type}`,
      });
      return;
    }

    setStep("confirm");
  };

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount);
    await executeTransaction(
      amountNum,
      config.buildTransaction,
      config.successMessage.replace("{amount}", amount).replace("{coin}", pool.coin),
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
                  {config.type === "supply"
                    ? `Earn ${pool.apy}% APY`
                    : `${config.maxAmountLabel}: ${config.maxAmount.toFixed(3)} ${pool.coin}`}
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

          <div className="p-6 space-y-6">
            {step === "input" ? (
              <LendingInputStep
                amount={amount}
                onAmountChange={handleAmountChange}
                onMaxClick={handleMaxClick}
                config={config}
                pool={pool}
                onContinue={handleContinue}
                estimatedYield={estimatedYield}
              />
            ) : (
              <LendingConfirmStep
                amount={amount}
                config={config}
                pool={pool}
                loading={loading}
                onBack={() => setStep("input")}
                onConfirm={handleConfirm}
                estimatedYield={estimatedYield}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
