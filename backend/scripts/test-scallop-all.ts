import { ScallopLending } from '../src/tools/scallop';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const logInfo = (msg: string) =>
  console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);
const logSuccess = (msg: string) =>
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
const logError = (msg: string) =>
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
const logSection = (msg: string) =>
  console.log(
    `\n${colors.bright}${colors.cyan}${'='.repeat(60)}${colors.reset}`,
  );

// Mock data for testing
const testAddress =
  '0x1234567890123456789012345678901234567890123456789012345678901234';
const mockObligationId =
  '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';
const mockObligationKey =
  '0x9876543210987654321098765432109876543210987654321098765432109876';

async function testAllFunctions() {
  console.log(
    `${colors.bright}${colors.cyan}╔${'═'.repeat(58)}╗${colors.reset}`,
  );
  console.log(
    `${colors.bright}${colors.cyan}║  🧪 Scallop Lending Integration - Full Test Suite        ║${colors.reset}`,
  );
  console.log(
    `${colors.bright}${colors.cyan}╚${'═'.repeat(58)}╝${colors.reset}\n`,
  );

  // Test 1: Supply Transaction
  logSection('');
  console.log(`${colors.bright}1. Testing Supply Transaction${colors.reset}`);
  logSection('');
  try {
    logInfo('Building SUI supply payload...');

    const supplyResult = await ScallopLending.buildSupplyTransaction({
      userAddress: testAddress,
      coinName: 'sui',
      amount: 1000000000, // 1 SUI
    });

    logSuccess('Supply payload built successfully!');
    console.log('  📦 Payload:');
    console.log('    TX Bytes:', supplyResult.txBytes.substring(0, 50) + '...');
    console.log('  📊 Market Info:');
    console.log(
      '    Supply APY:',
      supplyResult.marketInfo.supplyApy.toFixed(2) + '%',
    );
    console.log(
      '    Borrow APY:',
      supplyResult.marketInfo.borrowApy.toFixed(2) + '%',
    );
    console.log(
      '    Utilization:',
      (supplyResult.marketInfo.utilizationRate * 100).toFixed(2) + '%',
    );
  } catch (error) {
    logError('Failed to build supply payload');
    console.error('  Error:', error instanceof Error ? error.message : error);
  }

  // Test 2: Withdraw Transaction
  logSection('');
  console.log(`${colors.bright}2. Testing Withdraw Transaction${colors.reset}`);
  logSection('');
  try {
    logInfo('Building USDC withdraw payload...');

    const withdrawResult = await ScallopLending.buildWithdrawTransaction({
      userAddress: testAddress,
      coinName: 'usdc',
      amount: 50000000, // 50 USDC
    });

    logSuccess('Withdraw payload built successfully!');
    console.log('  📦 Payload:');
    console.log('    TX Bytes:', withdrawResult.txBytes.substring(0, 50) + '...');
    console.log('  📊 Market Info:');
    console.log(
      '    Supply APY:',
      withdrawResult.marketInfo.supplyApy.toFixed(2) + '%',
    );
    console.log(
      '    Borrow APY:',
      withdrawResult.marketInfo.borrowApy.toFixed(2) + '%',
    );
  } catch (error) {
    logError('Failed to build withdraw payload');
    console.error('  Error:', error instanceof Error ? error.message : error);
  }

  // Test 3: Borrow Transaction
  logSection('');
  console.log(`${colors.bright}3. Testing Borrow Transaction${colors.reset}`);
  logSection('');
  try {
    logInfo('Building borrow payload...');

    const borrowResult = await ScallopLending.buildBorrowTransaction({
      userAddress: testAddress,
      borrowCoinName: 'usdc',
      borrowAmount: 100000000, // 100 USDC
      collateralCoinName: 'sui',
      collateralAmount: 2000000000, // 2 SUI
      obligationId: mockObligationId,
      obligationKey: mockObligationKey,
    });

    logSuccess('Borrow payload built successfully!');
    console.log('  📦 Payload:');
    console.log('    TX Bytes:', borrowResult.txBytes.substring(0, 50) + '...');
    console.log('  🔑 Obligation ID:', borrowResult.obligationId);
    console.log('  📊 Market Info:');
    console.log(
      '    Borrow APY:',
      borrowResult.marketInfo.borrowApy.toFixed(2) + '%',
    );
    console.log(
      '    Utilization:',
      (borrowResult.marketInfo.utilizationRate * 100).toFixed(2) + '%',
    );
  } catch (error) {
    logError('Failed to build borrow payload');
    console.error('  Error:', error instanceof Error ? error.message : error);
  }

  // Test 4: Repay Transaction
  logSection('');
  console.log(`${colors.bright}4. Testing Repay Transaction${colors.reset}`);
  logSection('');
  try {
    logInfo('Building repay payload...');

    const repayResult = await ScallopLending.buildRepayTransaction({
      userAddress: testAddress,
      coinName: 'usdc',
      amount: 50000000, // 50 USDC
      obligationId: mockObligationId,
      obligationKey: mockObligationKey,
    });

    logSuccess('Repay payload built successfully!');
    console.log('  📦 Payload:');
    console.log('    TX Bytes:', repayResult.txBytes.substring(0, 50) + '...');
    console.log('  🔑 Obligation ID:', repayResult.obligationId);
  } catch (error) {
    logError('Failed to build repay payload');
    console.error('  Error:', error instanceof Error ? error.message : error);
  }

  // Test 5: Withdraw Collateral Transaction
  logSection('');
  console.log(
    `${colors.bright}5. Testing Withdraw Collateral Transaction${colors.reset}`,
  );
  logSection('');
  try {
    logInfo('Building withdraw collateral payload...');

    const withdrawCollateralResult =
      await ScallopLending.buildWithdrawCollateralTransaction({
        userAddress: testAddress,
        coinName: 'sui',
        amount: 500000000, // 0.5 SUI
        obligationId: mockObligationId,
        obligationKey: mockObligationKey,
      });

    logSuccess('Withdraw collateral payload built successfully!');
    console.log('  📦 Payload:');
    console.log('    TX Bytes:', withdrawCollateralResult.txBytes.substring(0, 50) + '...');
    console.log('  🔑 Obligation ID:', withdrawCollateralResult.obligationId);
  } catch (error) {
    logError('Failed to build withdraw collateral payload');
    console.error('  Error:', error instanceof Error ? error.message : error);
  }

  // Test 6: Open Obligation Transaction
  logSection('');
  console.log(
    `${colors.bright}6. Testing Open Obligation Transaction${colors.reset}`,
  );
  logSection('');
  try {
    logInfo('Building open obligation payload...');

    const openObligationResult =
      await ScallopLending.buildOpenObligationTransaction();

    logSuccess('Open obligation payload built successfully!');
    console.log('  📦 Payload:');
    console.log('    TX Bytes:', openObligationResult.txBytes.substring(0, 50) + '...');
  } catch (error) {
    logError('Failed to build open obligation payload');
    console.error('  Error:', error instanceof Error ? error.message : error);
  }

  // Test 7: Get Market Info
  logSection('');
  console.log(`${colors.bright}7. Testing Get Market Info${colors.reset}`);
  logSection('');
  try {
    logInfo('Fetching SUI market info...');

    const marketInfo = await ScallopLending.getMarketInfo('sui');

    logSuccess('Market info fetched successfully!');
    console.log('  📊 SUI Market Data:');
    console.log('    Supply APY:', marketInfo.supplyApy.toFixed(4) + '%');
    console.log('    Borrow APY:', marketInfo.borrowApy.toFixed(4) + '%');
    console.log(
      '    Utilization:',
      (marketInfo.utilizationRate * 100).toFixed(2) + '%',
    );
    console.log('    Total Supply:', marketInfo.totalSupply);
    console.log('    Total Borrow:', marketInfo.totalBorrow);
    console.log(
      '    Max Collateral Factor:',
      (marketInfo.maxCollateralFactor * 100).toFixed(2) + '%',
    );
  } catch (error) {
    logError('Failed to fetch market info');
    console.error('  Error:', error instanceof Error ? error.message : error);
  }

  // Summary
  logSection('');
  console.log(
    `\n${colors.bright}${colors.green}✅ Test Suite Completed!${colors.reset}\n`,
  );
  console.log(`${colors.cyan}Next Steps:${colors.reset}`);
  console.log(
    '  1. Frontend receives payload from these functions',
  );
  console.log('  2. Frontend creates Transaction and adds moveCall');
  console.log('  3. Frontend adds user coins to transaction');
  console.log('  4. Frontend signs with Passkey');
  console.log('  5. Frontend executes transaction on-chain\n');
}

testAllFunctions().catch((error) => {
  console.error('Test suite failed:', error);
  process.exit(1);
});
