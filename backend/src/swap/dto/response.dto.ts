import { ApiProperty } from '@nestjs/swagger';
import { SwapProvider } from '../../tools/middleware/trading/pre-swap';

export class SwapQuoteResponseDto {
  @ApiProperty({ example: 'cetus' })
  provider: SwapProvider;

  @ApiProperty({ example: '1000000000' })
  fromAmount: string;

  @ApiProperty({ example: '950000000' })
  toAmount: string;

  @ApiProperty({ example: 10.5, required: false })
  fromAmountUsd?: number;

  @ApiProperty({ example: 9.8, required: false })
  toAmountUsd?: number;

  @ApiProperty({ example: ['0x2::sui::SUI', '0x...::usdc::USDC'], required: false })
  path?: string[];

  @ApiProperty({ example: 0.5, required: false })
  slippage?: number;

  @ApiProperty({ example: '1000', required: false })
  estimatedGas?: string;

  @ApiProperty({ required: false })
  quotes?: any[];
}

export class SwapExecutionResponseDto {
  @ApiProperty({ example: 'cetus' })
  provider: SwapProvider;

  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: '0xabc123...', required: false })
  hash?: string;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ required: false })
  transactionData?: any;
}

export class SwapResponseDto<T> {
  @ApiProperty({ example: 'Swap aggregator pre-swap successful' })
  message: string;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: Date.now() })
  timestamp: number;
}
