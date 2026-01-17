/**
 * Scallop Client for Frontend
 * Builds transactions directly on frontend with wallet context
 */

import { Scallop } from '@scallop-io/sui-scallop-sdk';
import { Transaction } from '@mysten/sui/transactions';

let scallopInstance: Scallop | null = null;

async function getScallopSdk(): Promise<Scallop> {
  if (!scallopInstance) {
    scallopInstance = new Scallop({
      networkType: 'mainnet',
    });
    await scallopInstance.init();
  }
  return scallopInstance;
}

export async function getScallopPosition(userAddress: string) {
  try {
    // Query from backend (which has workaround for SDK bug)
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

    console.log('📊 Fetching position from backend for:', userAddress);

    const response = await fetch(`${backendUrl}/scallop/position/${userAddress}`);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status}`);
    }

    const { data } = await response.json();
    console.log('✅ Position from backend:', data);

    return data;
  } catch (error) {
    console.error('Get Scallop position failed:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get Scallop position');
  }
}

export async function buildDepositTransaction(
  userAddress: string,
  coinName: string,
  amount: number, // in MIST
): Promise<{
  transaction: Transaction;
  apy: number;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
    utilizationRate: number;
  };
}> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    // Get market info
    const marketPool = await scallopQuery.getMarketPool(coinName);
    const apy = marketPool?.supplyApy || 0;
    const borrowApy = marketPool?.borrowApy || 0;
    const utilizationRate = marketPool?.utilizationRate || 0;

    console.log('✅ Building simple deposit (will receive market coins)');

    // Build simple deposit transaction (receives sSUI)
    const txBlock = await scallopClient.deposit(
      coinName,
      amount,
      false, // withTransfer
    );

    // Set sender to enable gas coin selection
    txBlock.setSender(userAddress);

    return {
      transaction: txBlock,
      apy: Number(apy),
      marketInfo: {
        supplyApy: Number(apy),
        borrowApy: Number(borrowApy),
        utilizationRate: Number(utilizationRate),
      },
    };
  } catch (error) {
    console.error('Build deposit transaction failed:', error);
    throw new Error(
      `Failed to build deposit transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Build supply transaction with collateral (shows in position, enables borrowing)
 * Use this if you want to borrow against your deposit
 */
export async function buildSupplyAsCollateralTransaction(
  userAddress: string,
  coinName: string,
  amount: number, // in MIST
): Promise<{
  transaction: Transaction;
  apy: number;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
    utilizationRate: number;
  };
}> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    // Get market info
    const marketPool = await scallopQuery.getMarketPool(coinName);
    const apy = marketPool?.supplyApy || 0;
    const borrowApy = marketPool?.borrowApy || 0;
    const utilizationRate = marketPool?.utilizationRate || 0;

    // Check localStorage first for cached obligation ID (workaround for SDK bug)
    const cachedObligationId = localStorage.getItem(`scallop_obligation_${userAddress}`);
    const cachedObligationKey = localStorage.getItem(`scallop_obligation_key_${userAddress}`);

    let obligationId: string | undefined = cachedObligationId || undefined;
    let obligationKey: string | undefined = cachedObligationKey || undefined;

    if (cachedObligationId) {
      console.log('✅ Using cached obligation:', cachedObligationId);
    } else {
      // Fallback to SDK query
      const obligations = await scallopQuery.getObligations(userAddress);
      console.log('obligations from SDK:', JSON.stringify(obligations, null, 2));

      if (obligations && obligations.length > 0) {
        obligationId = obligations[0].id;
        obligationKey = obligations[0].keyId;
        console.log('✅ Using existing obligation from SDK:', obligationId);

        // Cache it for future use
        localStorage.setItem(`scallop_obligation_${userAddress}`, obligationId);
        if (obligationKey) {
          localStorage.setItem(`scallop_obligation_key_${userAddress}`, obligationKey);
        }
      } else {
        console.log('⚠️ No obligation found, will create one');
      }
    }

    // Build transaction with wallet context
    // depositCollateral will auto-create obligation if needed
    const txBlock = await scallopClient.depositCollateral(
      coinName,
      amount,
      false, // isObligationLocked
      obligationId,
      obligationKey,
    );

    // Set sender to enable gas coin selection
    txBlock.setSender(userAddress);

    return {
      transaction: txBlock,
      apy: Number(apy),
      marketInfo: {
        supplyApy: Number(apy),
        borrowApy: Number(borrowApy),
        utilizationRate: Number(utilizationRate),
      },
    };
  } catch (error) {
    console.error('Build supply as collateral transaction failed:', error);
    throw new Error(
      `Failed to build supply transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Build borrow transaction
 */
export async function buildBorrowTransaction(
  userAddress: string,
  coinName: string,
  amount: number, // in MIST
): Promise<{
  transaction: Transaction;
  borrowApy: number;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
    utilizationRate: number;
  };
}> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    // Get market info
    const marketPool = await scallopQuery.getMarketPool(coinName);
    const supplyApy = marketPool?.supplyApy || 0;
    const borrowApy = marketPool?.borrowApy || 0;
    const utilizationRate = marketPool?.utilizationRate || 0;

    // Get user's obligation (check localStorage first)
    const cachedObligationId = localStorage.getItem(`scallop_obligation_${userAddress}`);
    const cachedObligationKey = localStorage.getItem(`scallop_obligation_key_${userAddress}`);

    let obligationId: string;
    let obligationKey: string;

    if (cachedObligationId && cachedObligationKey) {
      obligationId = cachedObligationId;
      obligationKey = cachedObligationKey;
      console.log('✅ Using cached obligation for borrow:', obligationId);
    } else {
      // Fallback to SDK query
      const obligations = await scallopQuery.getObligations(userAddress);
      if (!obligations || obligations.length === 0) {
        throw new Error('No obligation found. Please supply collateral first.');
      }

      obligationId = obligations[0].id;
      obligationKey = obligations[0].keyId;
      console.log('✅ Using obligation from SDK for borrow:', obligationId);

      // Cache for future use
      localStorage.setItem(`scallop_obligation_${userAddress}`, obligationId);
      localStorage.setItem(`scallop_obligation_key_${userAddress}`, obligationKey);
    }

    // Build borrow transaction
    const txBlock = await scallopClient.borrow(
      coinName,
      amount,
      obligationId,
      obligationKey,
    );

    // Set sender to enable gas coin selection
    txBlock.setSender(userAddress);

    return {
      transaction: txBlock,
      borrowApy: Number(borrowApy),
      marketInfo: {
        supplyApy: Number(supplyApy),
        borrowApy: Number(borrowApy),
        utilizationRate: Number(utilizationRate),
      },
    };
  } catch (error) {
    console.error('Build borrow transaction failed:', error);
    throw new Error(
      `Failed to build borrow transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Build repay transaction
 */
export async function buildRepayTransaction(
  userAddress: string,
  coinName: string,
  amount: number, // in MIST
): Promise<{
  transaction: Transaction;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
    utilizationRate: number;
  };
}> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    // Get market info
    const marketPool = await scallopQuery.getMarketPool(coinName);
    const supplyApy = marketPool?.supplyApy || 0;
    const borrowApy = marketPool?.borrowApy || 0;
    const utilizationRate = marketPool?.utilizationRate || 0;

    // Get user's obligation (check localStorage first)
    const cachedObligationId = localStorage.getItem(`scallop_obligation_${userAddress}`);
    const cachedObligationKey = localStorage.getItem(`scallop_obligation_key_${userAddress}`);

    let obligationId: string;
    let obligationKey: string;

    if (cachedObligationId && cachedObligationKey) {
      obligationId = cachedObligationId;
      obligationKey = cachedObligationKey;
      console.log('✅ Using cached obligation for repay:', obligationId);
    } else {
      // Fallback to SDK query
      const obligations = await scallopQuery.getObligations(userAddress);
      if (!obligations || obligations.length === 0) {
        throw new Error('No obligation found.');
      }

      obligationId = obligations[0].id;
      obligationKey = obligations[0].keyId;
      console.log('✅ Using obligation from SDK for repay:', obligationId);

      // Cache for future use
      localStorage.setItem(`scallop_obligation_${userAddress}`, obligationId);
      localStorage.setItem(`scallop_obligation_key_${userAddress}`, obligationKey);
    }

    // Build repay transaction
    const txBlock = await scallopClient.repay(
      coinName,
      amount,
      obligationId,
      obligationKey,
    );

    // Set sender to enable gas coin selection
    txBlock.setSender(userAddress);

    return {
      transaction: txBlock,
      marketInfo: {
        supplyApy: Number(supplyApy),
        borrowApy: Number(borrowApy),
        utilizationRate: Number(utilizationRate),
      },
    };
  } catch (error) {
    console.error('Build repay transaction failed:', error);
    throw new Error(
      `Failed to build repay transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Build withdraw transaction
 */
export async function buildWithdrawTransaction(
  userAddress: string,
  coinName: string,
  amount: number, // in MIST
): Promise<{
  transaction: Transaction;
  marketInfo: {
    supplyApy: number;
    borrowApy: number;
    utilizationRate: number;
  };
}> {
  try {
    const scallop = await getScallopSdk();

    const [scallopQuery, scallopClient] = await Promise.all([
      scallop.createScallopQuery(),
      scallop.createScallopClient(),
    ]);

    // Get market info
    const marketPool = await scallopQuery.getMarketPool(coinName);
    const supplyApy = marketPool?.supplyApy || 0;
    const borrowApy = marketPool?.borrowApy || 0;
    const utilizationRate = marketPool?.utilizationRate || 0;

    // Get user's obligation (check localStorage first)
    const cachedObligationId = localStorage.getItem(`scallop_obligation_${userAddress}`);
    const cachedObligationKey = localStorage.getItem(`scallop_obligation_key_${userAddress}`);

    let obligationId: string;
    let obligationKey: string;

    if (cachedObligationId && cachedObligationKey) {
      obligationId = cachedObligationId;
      obligationKey = cachedObligationKey;
      console.log('✅ Using cached obligation for withdraw:', obligationId);
    } else {
      // Fallback to SDK query
      const obligations = await scallopQuery.getObligations(userAddress);
      if (!obligations || obligations.length === 0) {
        throw new Error('No obligation found. Please supply collateral first.');
      }

      obligationId = obligations[0].id;
      obligationKey = obligations[0].keyId;
      console.log('✅ Using obligation from SDK for withdraw:', obligationId);

      // Cache for future use
      localStorage.setItem(`scallop_obligation_${userAddress}`, obligationId);
      localStorage.setItem(`scallop_obligation_key_${userAddress}`, obligationKey);
    }

    // Try using withdraw instead of withdrawCollateral
    // withdrawCollateral requires ObligationKey ownership
    // withdraw might work for simple deposits
    console.log('⚠️ Attempting withdraw (not withdrawCollateral)...');

    const txBlock = await scallopClient.withdraw(
      coinName,
      amount,
    );

    // Set sender to enable gas coin selection
    txBlock.setSender(userAddress);

    return {
      transaction: txBlock,
      marketInfo: {
        supplyApy: Number(supplyApy),
        borrowApy: Number(borrowApy),
        utilizationRate: Number(utilizationRate),
      },
    };
  } catch (error) {
    console.error('Build withdraw transaction failed:', error);
    throw new Error(
      `Failed to build withdraw transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

/**
 * Get user's lending position (query only - can also be done via backend)
 */
export async function getLendingPosition(userAddress: string) {
  try {
    const scallop = await getScallopSdk();
    const scallopQuery = await scallop.createScallopQuery();

    const obligations = await scallopQuery.getObligations(userAddress);

    if (!obligations || obligations.length === 0) {
      return {
        supplied: [],
        borrowed: [],
        collateral: [],
        totalSuppliedValue: '0',
        totalBorrowedValue: '0',
        healthFactor: 0,
      };
    }

    const obligation = obligations[0];

    return {
      supplied: obligation.collaterals || [],
      borrowed: obligation.debts || [],
      collateral: obligation.collaterals || [],
      totalSuppliedValue: '0',
      totalBorrowedValue: obligation.borrowedValue?.toString() || '0',
      healthFactor: obligation.healthFactor || 0,
    };
  } catch (error) {
    console.error('Get lending position failed:', error);
    throw error;
  }
}
