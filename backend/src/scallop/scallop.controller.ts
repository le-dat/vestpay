import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ScallopService } from './scallop.service';
import {
  BuildSupplyDto,
  BuildWithdrawDto,
  BuildBorrowDto,
  BuildRepayDto,
  BuildWithdrawCollateralDto,
} from './dto/scallop.dto';

@Controller('scallop')
export class ScallopController {
  constructor(private readonly scallopService: ScallopService) {}

  /**
   * Build supply transaction payload
   * POST /scallop/supply/build
   */
  @Post('supply/build')
  async buildSupplyTransaction(@Body() dto: BuildSupplyDto) {
    return this.scallopService.buildSupplyTransaction(dto);
  }

  /**
   * Build withdraw transaction payload
   * POST /scallop/withdraw/build
   */
  @Post('withdraw/build')
  async buildWithdrawTransaction(@Body() dto: BuildWithdrawDto) {
    return this.scallopService.buildWithdrawTransaction(dto);
  }

  /**
   * Build borrow transaction payload
   * POST /scallop/borrow/build
   */
  @Post('borrow/build')
  async buildBorrowTransaction(@Body() dto: BuildBorrowDto) {
    return this.scallopService.buildBorrowTransaction(dto);
  }

  /**
   * Build repay transaction payload
   * POST /scallop/repay/build
   */
  @Post('repay/build')
  async buildRepayTransaction(@Body() dto: BuildRepayDto) {
    return this.scallopService.buildRepayTransaction(dto);
  }

  /**
   * Build withdraw collateral transaction payload
   * POST /scallop/collateral/withdraw/build
   */
  @Post('collateral/withdraw/build')
  async buildWithdrawCollateralTransaction(
    @Body() dto: BuildWithdrawCollateralDto,
  ) {
    return this.scallopService.buildWithdrawCollateralTransaction(dto);
  }

  /**
   * Build open obligation transaction payload
   * POST /scallop/obligation/open/build
   */
  @Post('obligation/open/build')
  async buildOpenObligationTransaction() {
    return this.scallopService.buildOpenObligationTransaction();
  }

  /**
   * Get user's lending position
   * GET /scallop/position/:address
   */
  @Get('position/:address')
  async getLendingPosition(@Param('address') address: string) {
    return this.scallopService.getLendingPosition(address);
  }

  /**
   * Get market info for a specific coin
   * GET /scallop/market/:coinName
   */
  @Get('market/:coinName')
  async getMarketInfo(@Param('coinName') coinName: string) {
    return this.scallopService.getMarketInfo(coinName);
  }
}
