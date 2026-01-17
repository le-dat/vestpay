import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  AggregatorPreSwapRequestDto,
  AggregatorSwapRequestDto,
} from './dto';
import {
  SwapResponseDto,
  SwapQuoteResponseDto,
  SwapExecutionResponseDto,
} from './dto/response.dto';
import { SwapAggregatorService } from './services/aggregator.service';

@ApiTags('Swap Aggregator')
@Controller('swap')
export class SwapController {
  constructor(
    private readonly swapAggregatorService: SwapAggregatorService,
  ) { }

  @Post('aggregator/pre-swap')
  @ApiOperation({ summary: 'Get swap quote from specified DEX provider' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved swap quote',
    type: SwapQuoteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters',
  })
  async aggregatorPreSwap(
    @Body() swapRequest: AggregatorPreSwapRequestDto,
  ): Promise<SwapResponseDto<SwapQuoteResponseDto>> {
    return await this.swapAggregatorService.preSwap(swapRequest);
  }

  @Post('aggregator/swap')
  @ApiOperation({ summary: 'Execute swap on specified DEX provider' })
  @ApiResponse({
    status: 200,
    description: 'Successfully executed swap',
    type: SwapExecutionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid parameters or swap execution failed',
  })
  async aggregatorSwap(
    @Body() swapRequest: AggregatorSwapRequestDto,
  ): Promise<SwapResponseDto<SwapExecutionResponseDto>> {
    return await this.swapAggregatorService.executeSwap(swapRequest);
  }
}
