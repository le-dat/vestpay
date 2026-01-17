import { Injectable } from '@nestjs/common';
import { ScallopLending } from '../tools/scallop';
import {
  BuildSupplyDto,
  BuildWithdrawDto,
  BuildBorrowDto,
  BuildRepayDto,
  BuildWithdrawCollateralDto,
} from './dto/scallop.dto';

@Injectable()
export class ScallopService {
  async buildSupplyTransaction(dto: BuildSupplyDto) {
    try {
      const result = await ScallopLending.buildSupplyTransaction({
        userAddress: dto.userAddress,
        coinName: dto.coinName,
        amount: dto.amount,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to build supply transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async buildWithdrawTransaction(dto: BuildWithdrawDto) {
    try {
      const result = await ScallopLending.buildWithdrawTransaction({
        userAddress: dto.userAddress,
        coinName: dto.coinName,
        amount: dto.amount,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to build withdraw transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async buildBorrowTransaction(dto: BuildBorrowDto) {
    try {
      const result = await ScallopLending.buildBorrowTransaction({
        userAddress: dto.userAddress,
        borrowCoinName: dto.borrowCoinName,
        borrowAmount: dto.borrowAmount,
        collateralCoinName: dto.collateralCoinName,
        collateralAmount: dto.collateralAmount,
        obligationId: dto.obligationId,
        obligationKey: dto.obligationKey,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to build borrow transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async buildRepayTransaction(dto: BuildRepayDto) {
    try {
      const result = await ScallopLending.buildRepayTransaction({
        userAddress: dto.userAddress,
        coinName: dto.coinName,
        amount: dto.amount,
        obligationId: dto.obligationId,
        obligationKey: dto.obligationKey,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to build repay transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async buildWithdrawCollateralTransaction(dto: BuildWithdrawCollateralDto) {
    try {
      const result = await ScallopLending.buildWithdrawCollateralTransaction({
        userAddress: dto.userAddress,
        coinName: dto.coinName,
        amount: dto.amount,
        obligationId: dto.obligationId,
        obligationKey: dto.obligationKey,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to build withdraw collateral transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async buildOpenObligationTransaction() {
    try {
      const result = await ScallopLending.buildOpenObligationTransaction();

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to build open obligation transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getLendingPosition(address: string) {
    try {
      const result = await ScallopLending.getLendingPosition(address);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to get lending position: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async getMarketInfo(coinName: string) {
    try {
      const result = await ScallopLending.getMarketInfo(coinName);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new Error(
        `Failed to get market info: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
