import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SwapProvider } from '../../tools/middleware/trading/pre-swap';

export class TokenInfoDto {
  @ApiProperty({
    example: '0x2::sui::SUI',
    description: 'Token address on Sui',
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    example: 'SUI',
    description: 'Token symbol',
  })
  @IsString()
  @IsNotEmpty()
  symbol!: string;

  @ApiProperty({
    example: 'Sui',
    description: 'Token name',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 9,
    description: 'Token decimals',
  })
  @IsNumber()
  @IsNotEmpty()
  decimals!: number;

  @ApiProperty({
    example: 'https://example.com/sui-logo.png',
    description: 'Token logo URL',
    required: false,
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;
}

export class AggregatorPreSwapRequestDto {
  @ApiProperty({
    enum: SwapProvider,
    example: SwapProvider.CETUS,
    description: 'Swap provider to use',
  })
  @IsEnum(SwapProvider)
  @IsNotEmpty()
  provider!: SwapProvider;

  @ApiProperty({
    type: TokenInfoDto,
    description: 'Source token information',
    example: {
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'Sui',
      decimals: 9,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => TokenInfoDto)
  @IsNotEmpty()
  fromToken!: TokenInfoDto;

  @ApiProperty({
    type: TokenInfoDto,
    description: 'Destination token information',
    example: {
      address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => TokenInfoDto)
  @IsNotEmpty()
  toToken!: TokenInfoDto;

  @ApiProperty({
    example: '1000000000',
    description: 'Amount to swap (in smallest unit)',
  })
  @IsString()
  @IsNotEmpty()
  amount!: string;

  @ApiProperty({
    example: 0.5,
    description: 'Slippage tolerance percentage (0-100)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  slippage?: number;

  @ApiProperty({
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'Recipient wallet address',
    required: false,
  })
  @IsString()
  @IsOptional()
  recipient?: string;
}

export class AggregatorSwapRequestDto {
  @ApiProperty({
    enum: SwapProvider,
    example: SwapProvider.CETUS,
    description: 'Swap provider to use',
  })
  @IsEnum(SwapProvider)
  @IsNotEmpty()
  provider!: SwapProvider;

  @ApiProperty({
    example: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    description: 'User wallet address',
  })
  @IsString()
  @IsNotEmpty()
  userAddress!: string;

  @ApiProperty({
    type: TokenInfoDto,
    description: 'Source token information',
    example: {
      address: '0x2::sui::SUI',
      symbol: 'SUI',
      name: 'Sui',
      decimals: 9,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => TokenInfoDto)
  @IsNotEmpty()
  fromToken!: TokenInfoDto;

  @ApiProperty({
    type: TokenInfoDto,
    description: 'Destination token information',
    example: {
      address: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN',
      symbol: 'USDC',
      name: 'USD Coin',
      decimals: 6,
    },
  })
  @IsObject()
  @ValidateNested()
  @Type(() => TokenInfoDto)
  @IsNotEmpty()
  toToken!: TokenInfoDto;

  @ApiProperty({
    example: '1000000000',
    description: 'Amount of input tokens (from pre-swap)',
  })
  @IsString()
  @IsNotEmpty()
  fromAmount!: string;

  @ApiProperty({
    example: '950000000',
    description: 'Expected amount of output tokens (from pre-swap)',
  })
  @IsString()
  @IsNotEmpty()
  toAmount!: string;

  @ApiProperty({
    example: ['0x2::sui::SUI', '0x...::usdc::USDC'],
    description: 'Swap route path (array of token addresses)',
    required: false,
    type: [String],
  })
  @IsOptional()
  path?: string[];

  @ApiProperty({
    example: 0.5,
    description: 'Slippage tolerance percentage (0-100)',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  slippage?: number;

  @ApiProperty({
    example: 'base64_encoded_private_key',
    description: 'Private key for signing transaction',
    required: false,
  })
  @IsString()
  @IsOptional()
  privateKey?: string;
}
