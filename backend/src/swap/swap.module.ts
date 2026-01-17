import { Module } from '@nestjs/common';
import { SwapController } from './swap.controller';
import { SwapAggregatorService } from './services/aggregator.service';

@Module({
  controllers: [SwapController],
  providers: [SwapAggregatorService],
  exports: [SwapAggregatorService],
})
export class SwapModule { }
