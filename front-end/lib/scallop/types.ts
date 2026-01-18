import { Transaction } from '@mysten/sui/transactions';

export interface ISupplyRequest {
  userAddress: string;
  coinName: string;
  amount: number;
  decimals: number;
}

export interface ISupplyTransactionResponse {
  transaction: Transaction;
}

export interface IWithdrawRequest {
  userAddress: string;
  coinName: string;
  amount: number;
  decimals: number;
}

export interface IWithdrawTransactionResponse {
  transaction: Transaction;
}