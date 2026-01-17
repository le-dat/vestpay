// Export all types
export * from './types';

// Export all functions
export { buildSupplyTransaction } from './supply';
export { buildWithdrawTransaction } from './withdraw';
export { buildBorrowTransaction } from './borrow';
export { buildRepayTransaction } from './repay';
export { buildWithdrawCollateralTransaction } from './collateral';
export { buildOpenObligationTransaction } from './obligation';
export { getLendingPosition, getMarketInfo } from './query';

// Export legacy class for backward compatibility
import { buildSupplyTransaction } from './supply';
import { buildWithdrawTransaction } from './withdraw';
import { buildBorrowTransaction } from './borrow';
import { buildRepayTransaction } from './repay';
import { buildWithdrawCollateralTransaction } from './collateral';
import { buildOpenObligationTransaction } from './obligation';
import { getLendingPosition, getMarketInfo } from './query';

export class ScallopLendingIntegration {
  static buildSupplyTransaction = buildSupplyTransaction;
  static buildWithdrawTransaction = buildWithdrawTransaction;
  static buildBorrowTransaction = buildBorrowTransaction;
  static buildRepayTransaction = buildRepayTransaction;
  static buildWithdrawCollateralTransaction = buildWithdrawCollateralTransaction;
  static buildOpenObligationTransaction = buildOpenObligationTransaction;
  static getLendingPosition = getLendingPosition;
  static getMarketInfo = getMarketInfo;
}

export const ScallopLending = {
  buildSupplyTransaction,
  buildWithdrawTransaction,
  buildBorrowTransaction,
  buildRepayTransaction,
  buildWithdrawCollateralTransaction,
  buildOpenObligationTransaction,
  getLendingPosition,
  getMarketInfo,
};
