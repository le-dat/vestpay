/**
 * Test script to query Scallop position
 * Usage: npx ts-node scripts/test-position.ts <user-address>
 */

import { getLendingPosition } from '../src/tools/scallop/query';

async function main() {
  const userAddress = process.argv[2];

  if (!userAddress) {
    console.error('❌ Please provide user address');
    console.log('Usage: npx ts-node scripts/test-position.ts <user-address>');
    process.exit(1);
  }

  console.log('📊 Querying Scallop position for:', userAddress);
  console.log('');

  try {
    const position = await getLendingPosition(userAddress);
    console.log('position', position);
    console.log('✅ Position data:');
    console.log(JSON.stringify(position, null, 2));
    console.log('');

    // Summary
    console.log('📈 Summary:');
    console.log(`  Supplied Assets: ${position.supplied.length}`);
    console.log(`  Borrowed Assets: ${position.borrowed.length}`);
    console.log(`  Total Supplied Value: ${position.totalSuppliedValue}`);
    console.log(`  Total Borrowed Value: ${position.totalBorrowedValue}`);
    console.log(`  Health Factor: ${position.healthFactor}`);
    console.log('');

    if (position.supplied.length > 0) {
      console.log('💰 Supplied:');
      position.supplied.forEach((asset) => {
        const coinName = asset.coinType.includes('SUI')
          ? 'SUI'
          : asset.coinType.split('::').pop();
        const amount = (parseFloat(asset.amount) / 1_000_000_000).toFixed(4);
        console.log(`  - ${amount} ${coinName} (APY: ${asset.apy.toFixed(2)}%)`);
      });
      console.log('');
    }

    if (position.borrowed.length > 0) {
      console.log('📤 Borrowed:');
      position.borrowed.forEach((asset) => {
        const coinName = asset.coinType.includes('SUI')
          ? 'SUI'
          : asset.coinType.split('::').pop();
        const amount = (parseFloat(asset.amount) / 1_000_000_000).toFixed(4);
        console.log(`  - ${amount} ${coinName} (APY: ${asset.apy.toFixed(2)}%)`);
      });
      console.log('');
    }

    if (position.supplied.length === 0 && position.borrowed.length === 0) {
      console.log('⚠️  No position found!');
      console.log('');
      console.log('Possible reasons:');
      console.log('  1. No collateral deposited yet');
      console.log('  2. Used "Simple" deposit instead of "Collateral"');
      console.log('  3. Transaction not finalized yet');
      console.log('');
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
