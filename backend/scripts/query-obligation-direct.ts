/**
 * Query obligation directly using Sui client (bypass Scallop SDK)
 */

import { client } from '../src/tools/scallop/sdk';

const OBLIGATION_ID = '0x5ec78008dfeb1becc189d4cebf2be463cf2898547756bf08dfad14e7e3f4e330';
const USER_ADDRESS = '0x344602b63da6db8c17be3969c5b20a838a196c3b9f4b5ea0311da44025e412e1';

async function main() {
  console.log('🔍 Querying obligation directly from Sui blockchain...');
  console.log('');
  console.log('Obligation ID:', OBLIGATION_ID);
  console.log('User Address:', USER_ADDRESS);
  console.log('');

  try {
    // Get obligation object directly
    const obligationObj = await client.getObject({
      id: OBLIGATION_ID,
      options: {
        showContent: true,
        showOwner: true,
        showType: true,
      },
    });

    console.log('✅ Obligation found!');
    console.log('');
    console.log('📦 Object Data:');
    console.log(JSON.stringify(obligationObj, null, 2));
    console.log('');

    // Check owner
    if (obligationObj.data?.owner) {
      console.log('👤 Owner:', JSON.stringify(obligationObj.data.owner));
    }

    // Check content
    if (obligationObj.data?.content) {
      console.log('📄 Content:', JSON.stringify(obligationObj.data.content, null, 2));
    }

    console.log('');
    console.log('✅ Obligation exists on-chain!');
    console.log('⚠️  But Scallop SDK getObligations() cannot find it');
    console.log('');
    console.log('💡 Possible solutions:');
    console.log('  1. Wait a few minutes for indexer to catch up');
    console.log('  2. Use direct object query instead of SDK');
    console.log('  3. Store obligation ID in database after creation');
    console.log('  4. Check Scallop SDK version and update');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    
    console.log('');
    console.log('⚠️  Obligation not found on-chain!');
    console.log('This could mean:');
    console.log('  1. Obligation ID is incorrect');
    console.log('  2. Object was deleted/consumed');
    console.log('  3. Network mismatch (testnet vs mainnet)');
  }
}

main();
