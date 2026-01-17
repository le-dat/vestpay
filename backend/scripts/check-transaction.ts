/**
 * Check transaction details and verify obligation creation
 * Usage: npx ts-node scripts/check-transaction.ts <tx-digest>
 */

import { client } from '../src/tools/scallop/sdk';

async function main() {
  const txDigest = process.argv[2];

  if (!txDigest) {
    console.error('❌ Please provide transaction digest');
    console.log('Usage: npx ts-node scripts/check-transaction.ts <tx-digest>');
    process.exit(1);
  }

  console.log('🔍 Checking transaction:', txDigest);
  console.log('');

  try {
    const tx = await client.getTransactionBlock({
      digest: txDigest,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
        showInput: true,
      },
    });

    console.log('✅ Transaction found!');
    console.log('');

    // Status
    const status = tx.effects?.status?.status;
    console.log('📊 Status:', status === 'success' ? '✅ Success' : '❌ Failed');
    
    if (status !== 'success') {
      console.log('❌ Error:', tx.effects?.status?.error);
      process.exit(1);
    }

    console.log('');

    // Gas used
    const gasUsed = tx.effects?.gasUsed;
    if (gasUsed) {
      const totalGas = 
        BigInt(gasUsed.computationCost) + 
        BigInt(gasUsed.storageCost) - 
        BigInt(gasUsed.storageRebate);
      console.log('⛽ Gas Used:', (Number(totalGas) / 1_000_000_000).toFixed(6), 'SUI');
      console.log('');
    }

    // Object changes
    console.log('📦 Object Changes:');
    if (tx.objectChanges && tx.objectChanges.length > 0) {
      tx.objectChanges.forEach((change) => {
        if (change.type === 'created') {
          console.log(`  ✨ Created: ${change.objectType}`);
          console.log(`     ID: ${change.objectId}`);
          
          // Check if it's an obligation
          if (change.objectType.includes('Obligation')) {
            console.log('     🎉 THIS IS AN OBLIGATION!');
          }
        } else if (change.type === 'mutated') {
          console.log(`  🔄 Mutated: ${change.objectType}`);
        } else if (change.type === 'deleted') {
          console.log(`  🗑️  Deleted: ${change.objectType}`);
        }
      });
    } else {
      console.log('  (none)');
    }
    console.log('');

    // Events
    console.log('📢 Events:');
    if (tx.events && tx.events.length > 0) {
      tx.events.forEach((event) => {
        console.log(`  - ${event.type}`);
        if (event.type.includes('Deposit') || event.type.includes('Supply')) {
          console.log('    💰 This is a deposit event!');
          console.log('    Data:', JSON.stringify(event.parsedJson, null, 2));
        }
      });
    } else {
      console.log('  (none)');
    }
    console.log('');

    // Sender
    if (tx.transaction?.data?.sender) {
      console.log('👤 Sender:', tx.transaction.data.sender);
      console.log('');
    }

    // Summary
    console.log('📋 Summary:');
    const hasObligation = tx.objectChanges?.some(
      (change) => change.type === 'created' && change.objectType.includes('Obligation')
    );
    
    if (hasObligation) {
      console.log('  ✅ Obligation was created!');
      console.log('  ✅ Position should be visible');
    } else {
      console.log('  ⚠️  No obligation created');
      console.log('  ⚠️  This might be a simple deposit (not collateral)');
      console.log('');
      console.log('💡 To create obligation:');
      console.log('  1. Use "🔒 Collateral" deposit type');
      console.log('  2. Make sure you selected the right option in UI');
    }

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

main();
