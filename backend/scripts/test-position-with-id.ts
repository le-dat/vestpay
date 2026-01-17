/**
 * Test script to query Scallop position with obligation ID
 */

import { getLendingPosition } from '../src/tools/scallop/query';

const USER_ADDRESS = '0x344602b63da6db8c17be3969c5b20a838a196c3b9f4b5ea0311da44025e412e1';
const OBLIGATION_ID = '0x5ec78008dfeb1becc189d4cebf2be463cf2898547756bf08dfad14e7e3f4e330';

async function main() {
  console.log('📊 Querying Scallop position WITH obligation ID');
  console.log('User:', USER_ADDRESS);
  console.log('Obligation ID:', OBLIGATION_ID);
  console.log('');

  try {
    const position = await getLendingPosition(USER_ADDRESS, OBLIGATION_ID);

    console.log('✅ Position data:');
    console.log(JSON.stringify(position, null, 2));
    console.log('');

    // Summary
    console.log('📈 Summary:');
    console.log(`  Supplied Assets: ${position.supplied.length}`);
    console.log(`  Borrowed Assets: ${position.borrowed.length}`);
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
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
