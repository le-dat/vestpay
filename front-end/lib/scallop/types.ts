import { Transaction } from '@mysten/sui/transactions';

export interface ISupplyRequest{
  userAddress: string;
  coinName: string;
  amount: number;
}

export interface ISupplyTransactionResponse {
  transaction: Transaction;
}

export interface IWithdrawRequest {
  userAddress: string;
  coinName: string;
  amount: number;
}

export interface IWithdrawTransactionResponse {
  txBytes: string;
}