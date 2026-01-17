import { IsString, IsNumber, IsOptional } from 'class-validator';

export class BuildSupplyDto {
  @IsString()
  userAddress: string;

  @IsString()
  coinName: string;

  @IsNumber()
  amount: number;
}

export class BuildWithdrawDto {
  @IsString()
  userAddress: string;

  @IsString()
  coinName: string;

  @IsNumber()
  amount: number;
}

export class BuildBorrowDto {
  @IsString()
  userAddress: string;

  @IsString()
  borrowCoinName: string;

  @IsNumber()
  borrowAmount: number;

  @IsString()
  collateralCoinName: string;

  @IsNumber()
  collateralAmount: number;

  @IsString()
  @IsOptional()
  obligationId?: string;

  @IsString()
  @IsOptional()
  obligationKey?: string;
}

export class BuildRepayDto {
  @IsString()
  userAddress: string;

  @IsString()
  coinName: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  obligationId?: string;

  @IsString()
  @IsOptional()
  obligationKey?: string;
}

export class BuildWithdrawCollateralDto {
  @IsString()
  userAddress: string;

  @IsString()
  coinName: string;

  @IsNumber()
  amount: number;

  @IsString()
  obligationId: string;

  @IsString()
  obligationKey: string;
}
