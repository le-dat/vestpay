import { buildSwap } from '../lib/suilend';

const COIN_TYPES = {
  SUI: '0x2::sui::SUI',
  USDC: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
};

async function main() {
  const args = process.argv.slice(2);
  const userAddress = args[0] || '0x0000000000000000000000000000000000000000000000000000000000000001';
  const amountInSUI = parseFloat(args[1] || '1');
  const slippageBps = parseInt(args[2] || '100');

  try {
    const result = await buildSwap({
      userAddress,
      coinInType: COIN_TYPES.SUI,
      coinOutType: COIN_TYPES.USDC,
      amountIn: amountInSUI * 1e9,
      slippageTolerance: slippageBps,
    });

    console.log(JSON.stringify({
      quote: result.quote,
      slippage: result.slippage,
    }, null, 2));
  } catch (error) {
    console.error(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }));
    process.exit(1);
  }
}

main();
