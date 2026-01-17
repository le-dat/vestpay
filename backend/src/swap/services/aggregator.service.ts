import {
  Injectable,
  Logger,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  AggregatorPreSwapRequestDto,
  AggregatorSwapRequestDto,
} from '../dto/aggregator.dto';
import {
  SwapResponseDto,
  SwapQuoteResponseDto,
  SwapExecutionResponseDto,
} from '../dto/response.dto';
import { preSwapMiddleware } from '../../tools/middleware/trading/pre-swap';
import { executeSwapMiddleware } from '../../tools/middleware/trading/execute-swap';

@Injectable()
export class SwapAggregatorService {
  private readonly logger = new Logger(SwapAggregatorService.name);

  async preSwap(
    swapRequest: AggregatorPreSwapRequestDto,
  ): Promise<SwapResponseDto<SwapQuoteResponseDto>> {
    try {
      this.logger.log(
        `Pre-swap request for ${swapRequest.provider}: ${swapRequest.fromToken.symbol} -> ${swapRequest.toToken.symbol}`,
      );

      const result = await preSwapMiddleware({
        provider: swapRequest.provider,
        fromToken: swapRequest.fromToken,
        toToken: swapRequest.toToken,
        amount: swapRequest.amount,
        slippage: swapRequest.slippage,
        recipient: swapRequest.recipient,
      });

      this.logger.log(
        `Pre-swap successful for ${swapRequest.provider}: ${result.fromAmount} -> ${result.toAmount}`,
      );

      return {
        message: 'Swap aggregator pre-swap successful',
        data: result as SwapQuoteResponseDto,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error(
        `Pre-swap failed for ${swapRequest.provider}`,
        error instanceof Error ? error.stack : error,
      );

      if (error instanceof Error) {
        throw new BadRequestException(
          `Swap aggregator pre-swap failed: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Swap aggregator pre-swap failed: Unknown error',
      );
    }
  }

  async executeSwap(
    swapRequest: AggregatorSwapRequestDto,
  ): Promise<SwapResponseDto<SwapExecutionResponseDto>> {
    try {
      this.logger.log(
        `Execute swap request for ${swapRequest.provider}: ${swapRequest.userAddress}`,
      );

      const result = await executeSwapMiddleware({
        provider: swapRequest.provider,
        userAddress: swapRequest.userAddress,
        fromToken: swapRequest.fromToken,
        toToken: swapRequest.toToken,
        amountIn: swapRequest.fromAmount,
        amountOut: swapRequest.toAmount,
        path: swapRequest.path,
        slippage: swapRequest.slippage,
        privateKey: swapRequest.privateKey,
      });

      if (!result.success) {
        this.logger.warn(
          `Swap execution failed for ${swapRequest.provider}: ${result.error}`,
        );
        throw new BadRequestException(
          result.error || 'Swap execution failed',
        );
      }

      this.logger.log(
        `Swap executed successfully for ${swapRequest.provider}: ${result.hash}`,
      );

      return {
        message: 'Swap aggregator executed successfully',
        data: result as SwapExecutionResponseDto,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.logger.error(
        `Swap execution failed for ${swapRequest.provider}`,
        error instanceof Error ? error.stack : error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new BadRequestException(
          `Swap aggregator execution failed: ${error.message}`,
        );
      }
      throw new InternalServerErrorException(
        'Swap aggregator execution failed: Unknown error',
      );
    }
  }
}
