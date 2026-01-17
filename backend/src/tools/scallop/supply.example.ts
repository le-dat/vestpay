/**
 * Example usage of Scallop Supply (Deposit) function
 * 
 * This demonstrates how to use buildSupplyTransaction in a real scenario
 */

import { ScallopLending } from './index';

async function exampleSupply() {
  try {
    // 1. Build supply transaction on backend
    const result = await ScallopLending.buildSupplyTransaction({
      userAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1', // Example address
      coinName: 'sui', // Can be: 'sui', 'usdc', 'usdt', etc.
      amount: 1000000000, // 1 SUI (9 decimals)
    });

    console.log('Transaction built successfully!');
    console.log('Transaction Bytes (base64):', result.txBytes);
    console.log('Current Supply APY:', result.apy, '%');

    // 2. Return to frontend
    return {
      success: true,
      data: {
        txBytes: result.txBytes,
        apy: result.apy,
        message: `Supply transaction ready. APY: ${result.apy}%`,
      },
    };
  } catch (error) {
    console.error('Failed to build supply transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Frontend will then:
// 1. Receive txBlockBytes
// 2. Deserialize: Transaction.from(Buffer.from(txBlockBytes, 'base64'))
// 3. Sign with Passkey: keypair.sign(tx)
// 4. Execute: client.signAndExecuteTransaction({ signer: keypair, transaction: tx })

// Example with different amounts and coins
async function exampleMultipleSupplies() {
  const supplies = [
    { coinName: 'sui', amount: 1000000000 }, // 1 SUI
    { coinName: 'usdc', amount: 100000000 }, // 100 USDC (6 decimals)
    { coinName: 'usdt', amount: 50000000 }, // 50 USDT (6 decimals)
  ];

  const userAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1';

  for (const supply of supplies) {
    try {
      const result = await ScallopLending.buildSupplyTransaction({
        userAddress,
        coinName: supply.coinName,
        amount: supply.amount,
      });

      console.log(`\n${supply.coinName.toUpperCase()} Supply:`);
      console.log(`  Amount: ${supply.amount}`);
      console.log(`  APY: ${result.apy}%`);
      console.log(`  TX Ready: ✓`);
    } catch (error) {
      console.error(`Failed to build ${supply.coinName} supply:`, error);
    }
  }
}

// Run examples
if (require.main === module) {
  console.log('=== Scallop Supply Example ===\n');
  
  exampleSupply()
    .then((result) => {
      console.log('\n=== Result ===');
      console.log(JSON.stringify(result, null, 2));
    })
    .then(() => {
      console.log('\n=== Multiple Supplies Example ===');
      return exampleMultipleSupplies();
    })
    .catch(console.error);
}

export { exampleSupply, exampleMultipleSupplies };
