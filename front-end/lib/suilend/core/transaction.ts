import { Transaction } from '@mysten/sui/transactions';
// Note: Not using TransactionObjectArgument anymore - DEX SDKs handle coin selection
import type { StandardizedQuote } from '@suilend/sdk';
import { Token } from '@suilend/sui-fe';
import { client } from '../sdk';
import { getSwapQuotes, extractRawAmountOut, getDexSdk } from './quote';
import type { AggregatorClient } from '@cetusprotocol/aggregator-sdk';

// Cache for DEX SDK instances
let cetusSdkInstance: AggregatorClient | null = null;

async function getCetusSdk() {
  if (!cetusSdkInstance) {
    const { AggregatorClient } = await import('@cetusprotocol/aggregator-sdk');
    cetusSdkInstance = new AggregatorClient({ client });
  }
  return cetusSdkInstance;
}

export async function buildSwapTransactionFromQuote(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number,
  quote: StandardizedQuote,
  _coinIn?: unknown,  // Kept for backwards compatibility, not used
): Promise<{
  transaction: Transaction;
  estimatedAmountOut: number;
}> {
  // Validate balance first
  console.log('Validating balance for swap');

  const coins = await client.getCoins({
    owner: userAddress,
    coinType: tokenIn.coinType,
  });

  if (!coins.data || coins.data.length === 0) {
    throw new Error(`No ${tokenIn.symbol || tokenIn.coinType} coins found in wallet`);
  }

  const totalBalance = coins.data.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));
  const amountNeeded = BigInt(amountIn);

  if (totalBalance < amountNeeded) {
    throw new Error(`Insufficient balance. Need ${amountIn}, have ${totalBalance.toString()}`);
  }

  console.log(`Balance OK: ${coins.data.length} coin(s), total: ${totalBalance.toString()}`);

  // Validate quote
  if (!quote || !quote.provider || !quote.routes || quote.routes.length === 0) {
    throw new Error('Invalid quote object provided');
  }

  console.log('Building swap transaction for provider:', quote.provider);

  // Use provider-specific implementation
  const provider = quote.provider.toLowerCase();

  if (provider === 'cetus') {
    return buildCetusSwapTransaction(userAddress, tokenIn, tokenOut, amountIn, slippagePercent);
  }

  if (provider === 'aftermath') {
    return buildAftermathSwapTransaction(userAddress, tokenIn, tokenOut, amountIn, slippagePercent);
  }

  if (provider === 'flowx') {
    return buildFlowXSwapTransaction(userAddress, tokenIn, tokenOut, amountIn, slippagePercent);
  }

  // Fallback to Cetus for unknown providers
  console.warn(`Unknown provider "${quote.provider}", falling back to Cetus`);
  return buildCetusSwapTransaction(userAddress, tokenIn, tokenOut, amountIn, slippagePercent);
}

// Build swap transaction using Cetus SDK directly
async function buildCetusSwapTransaction(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number,
): Promise<{
  transaction: Transaction;
  estimatedAmountOut: number;
}> {
  const cetusSdk = await getCetusSdk();

  console.log('Getting Cetus route for swap:', {
    from: tokenIn.coinType,
    to: tokenOut.coinType,
    amount: amountIn
  });

  // Find routes using Cetus aggregator
  const routerResult = await cetusSdk.findRouters({
    from: tokenIn.coinType,
    target: tokenOut.coinType,
    amount: amountIn,
    byAmountIn: true,
  });

  if (!routerResult || routerResult.insufficientLiquidity) {
    throw new Error('No liquidity available for this swap');
  }

  console.log('Cetus route found:', {
    amountIn: routerResult.amountIn?.toString(),
    amountOut: routerResult.amountOut?.toString(),
  });

  // Build transaction using Cetus SDK
  const transaction = new Transaction();
  transaction.setSender(userAddress);

  // Use correct API: router (not routers), txb
  await cetusSdk.fastRouterSwap({
    router: routerResult,      // RouterDataV3 object
    txb: transaction,          // Transaction builder
    slippage: slippagePercent / 100,  // Convert to decimal (1% -> 0.01)
    refreshAllCoins: true,     // Let SDK handle all coin selection
  });

  console.log('Cetus transaction built successfully');

  // Extract amount out
  const estimatedAmountOut = routerResult.amountOut
    ? (typeof routerResult.amountOut.toNumber === 'function'
      ? routerResult.amountOut.toNumber()
      : Number(routerResult.amountOut))
    : 0;

  return {
    transaction,
    estimatedAmountOut,
  };
}

// Build swap transaction using Aftermath SDK
async function buildAftermathSwapTransaction(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number,
): Promise<{
  transaction: Transaction;
  estimatedAmountOut: number;
}> {
  const sdkMap = await getDexSdk();
  const aftermathSdk = sdkMap.aftermath;
  const router = aftermathSdk.Router();

  console.log('Getting Aftermath route for swap:', {
    from: tokenIn.coinType,
    to: tokenOut.coinType,
    amount: amountIn
  });

  // Get complete trade route from Aftermath
  const route = await router.getCompleteTradeRouteGivenAmountIn({
    coinIn: tokenIn.coinType,
    coinOut: tokenOut.coinType,
    amountIn: BigInt(amountIn),
  });

  if (!route) {
    throw new Error('No route found from Aftermath');
  }

  console.log('Aftermath route found:', {
    amountIn: route.amountIn?.toString(),
    amountOut: route.amountOut?.toString(),
  });

  // Build transaction using Aftermath SDK
  // Convert slippage percent to basis points (1% = 100 bps)
  const slippageBps = Math.round(slippagePercent * 100);

  const transaction = await router.getTransactionForCompleteTradeRoute({
    route,
    walletAddress: userAddress,
    slippageBps,
  });

  console.log('Aftermath transaction built successfully');

  // Extract amount out
  const estimatedAmountOut = route.amountOut
    ? Number(route.amountOut)
    : 0;

  return {
    transaction,
    estimatedAmountOut,
  };
}

// Build swap transaction using FlowX SDK
async function buildFlowXSwapTransaction(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number,
): Promise<{
  transaction: Transaction;
  estimatedAmountOut: number;
}> {
  const sdkMap = await getDexSdk();
  const flowxQuoter = sdkMap.flowx;

  console.log('Getting FlowX route for swap:', {
    from: tokenIn.coinType,
    to: tokenOut.coinType,
    amount: amountIn
  });

  // Get routes from FlowX
  const routes = await flowxQuoter.getRoutes({
    tokenIn: tokenIn.coinType,
    tokenOut: tokenOut.coinType,
    amountIn,
    includeSources: null,
    excludeSources: null,
    commission: null,
  });

  if (!routes || routes.length === 0) {
    throw new Error('No routes found from FlowX');
  }

  // Use the best route (first one)
  const bestRoute = routes[0];

  console.log('FlowX route found:', {
    amountIn: bestRoute.amountIn?.toString(),
    amountOut: bestRoute.amountOut?.toString(),
  });

  // Build transaction using FlowX SDK
  const { TradeBuilder } = await import('@flowx-finance/sdk');

  // Extract amount out from route
  const amountOut = bestRoute.amountOut || '0';

  // Build trade with slippage (FlowX expects slippage in native units, e.g., 1% = 0.01 * 1e6)
  const slippageValue = Math.round(slippagePercent * 1e6); // 1% = 10000 in 1e6 units

  const tradeBuilder = new TradeBuilder('mainnet', routes)
    .sender(userAddress)
    .amountIn(amountIn)
    .amountOut(amountOut)
    .slippage(slippageValue)
    .deadline(Date.now() + 3600 * 1000); // 1 hour deadline

  const trade = tradeBuilder.build();

  // Build transaction block - FlowX returns TransactionBlock which is compatible with Transaction
  const txBlock = await trade.swap({
    client,
    coinIn: undefined, // Auto-select coins
  });

  // Convert TransactionBlock to Transaction if needed
  // TransactionBlock from FlowX should be compatible with Transaction
  const transaction = txBlock as unknown as Transaction;

  // Ensure sender is set
  if (!transaction.getSender()) {
    transaction.setSender(userAddress);
  }

  console.log('FlowX transaction built successfully');

  // Extract amount out
  const estimatedAmountOut = typeof amountOut === 'string'
    ? Number(amountOut)
    : (typeof amountOut === 'bigint' ? Number(amountOut) : 0);

  return {
    transaction,
    estimatedAmountOut,
  };
}

export async function buildSwapTransaction(
  userAddress: string,
  tokenIn: Token,
  tokenOut: Token,
  amountIn: string,
  slippagePercent: number = 1,
): Promise<{
  transaction: Transaction;
  estimatedAmountOut: number;
  bestQuote: StandardizedQuote;
}> {
  const quotes = await getSwapQuotes(tokenIn, tokenOut, amountIn);

  if (!quotes || quotes.length === 0) {
    throw new Error('No swap quotes available');
  }

  const bestQuote = quotes[0];
  const result = await buildSwapTransactionFromQuote(
    userAddress,
    tokenIn,
    tokenOut,
    amountIn,
    slippagePercent,
    bestQuote
  );

  return {
    ...result,
    bestQuote,
  };
}

export function createTokenObject(coinType: string): Token {
  return {
    coinType,
    type: coinType,
    decimals: 9,
    description: '',
    name: '',
    symbol: '',
  } as unknown as Token;
}
