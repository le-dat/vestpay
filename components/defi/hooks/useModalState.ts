import { useState, useEffect } from 'react';

export interface UseModalStateReturn {
  amount: string;
  step: 'input' | 'confirm';
  setAmount: (value: string) => void;
  setStep: (step: 'input' | 'confirm') => void;
  handleAmountChange: (value: string) => void;
  handleMaxClick: (maxAmount: number) => void;
  resetState: () => void;
}

export function useModalState(isOpen: boolean): UseModalStateReturn {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm'>('input');

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount('');
      setStep('input');
    }
  }, [isOpen]);

  const handleAmountChange = (value: string) => {
    // Only allow valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const handleMaxClick = (maxAmount: number) => {
    setAmount(maxAmount.toString());
  };

  const resetState = () => {
    setAmount('');
    setStep('input');
  };

  return {
    amount,
    step,
    setAmount,
    setStep,
    handleAmountChange,
    handleMaxClick,
    resetState,
  };
}
