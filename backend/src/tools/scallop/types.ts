// Scallop Lending Types

// Build Supply Transaction
export interface BuildSupplyTransactionParams {
  userAddress: string;
  coinName: string;
  amount: number; // Amount in MIST (smallest unit)
}

export interface BuildSupplyTransactionResult {
  txBytes: string; // Base64 encoded transaction bytes
  apy: number;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
    utilizationRate: number;
  };
}

// Build Withdraw Transaction
export interface BuildWithdrawTransactionParams {
  userAddress: string;
  coinName: string;
  amount: number;
}

export interface BuildWithdrawTransactionResult {
  txBytes: string;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
  };
}

// Build Borrow Transaction
export interface BuildBorrowTransactionParams {
  userAddress: string;
  borrowCoinName: string;
  borrowAmount: number;
  collateralCoinName: string;
  collateralAmount: number;
  obligationId?: string;
  obligationKey?: string;
}

export interface BuildBorrowTransactionResult {
  txBytes: string;
  obligationId: string;
  marketInfo: {
    borrowApy: number;
    utilizationRate: number;
  };
}

// Build Repay Transaction
export interface BuildRepayTransactionParams {
  userAddress: string;
  coinName: string;
  amount: number;
  obligationId?: string;
  obligationKey?: string;
}

export interface BuildRepayTransactionResult {
  txBytes: string;
  obligationId: string;
}

// Build Withdraw Collateral Transaction
export interface BuildWithdrawCollateralTransactionParams {
  userAddress: string;
  coinName: string;
  amount: number;
  obligationId: string;
  obligationKey: string;
}

export interface BuildWithdrawCollateralTransactionResult {
  txBytes: string;
  obligationId: string;
}

// Query interfaces
export interface ScallopLendingPosition {
  supplied: Array<{
    coinType: string;
    amount: string;
    apy: number;
  }>;
  borrowed: Array<{
    coinType: string;
    amount: string;
    apy: number;
  }>;
  collateral: Array<{
    coinType: string;
    amount: string;
  }>;
  totalSuppliedValue: string;
  totalBorrowedValue: string;
  healthFactor: number;
}

export interface MarketInfo {
  supplyApy: number;
  borrowApy: number;
  totalSupply: string;
  totalBorrow: string;
  utilizationRate: number;
  maxCollateralFactor: number;
}
