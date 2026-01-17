import { getScallopSdk, client } from './sdk';
import { ScallopLendingPosition, MarketInfo } from './types';
import { queryObligationById, getKnownObligationId } from './query-direct';

interface ObligationData {
  debts?: Array<{ coinType: string; amount: number; borrowApy: number }>;
  collaterals?: Array<{ coinType: string; amount: number }>;
  healthFactor?: number;
  borrowedValue?: number;
}

interface PoolData {
  supply?: number;
  borrowed?: number;
  maxCollateralFactor?: number;
}

export async function getLendingPosition(
  userAddress: string,
  obligationId?: string,
): Promise<ScallopLendingPosition> {
  try {
    // WORKAROUND: Check if we have a known obligation ID for this user
    if (!obligationId) {
      const knownId = getKnownObligationId(userAddress);
      if (knownId) {
        obligationId = knownId;
        console.log('🔍 Using known obligation ID:', obligationId);
      }
    }

    // If we have obligation ID, query directly (workaround for SDK bug)
    if (obligationId) {
      try {
        return await queryObligationById(obligationId);
      } catch (err) {
        console.error('Direct query failed, falling back to SDK:', err);
      }
    }

    // Fallback to SDK query
    const scallop = await getScallopSdk();
    const scallopQuery = await scallop.createScallopQuery();

    console.log('Querying obligations by user address:', userAddress);
    const obligations = await scallopQuery.getObligations(userAddress);

    // If no obligations, return empty position
    if (!obligations || obligations.length === 0) {
      console.log('No obligations found for user:', userAddress);
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
    const obligationData = obligation as unknown as ObligationData;

    // Get supplied assets (deposits) from the obligation
    // Note: Scallop stores deposits in collateral when used as collateral
    // and separately tracks pure deposits (not used as collateral)
    const supplied: Array<{
      coinType: string;
      amount: string;
      apy: number;
    }> = [];

    // Get collateral assets (these are supplied and used as collateral)
    const collateral =
      obligationData.collaterals?.map((col) => ({
        coinType: col.coinType,
        amount: col.amount.toString(),
      })) || [];

    // For now, treat collateral as supplied assets with APY
    // In Scallop, collateral = supplied assets used for borrowing
    for (const col of collateral) {
      try {
        // Get market info to fetch supply APY
        const coinName = col.coinType.includes('SUI')
          ? 'sui'
          : col.coinType.split('::').pop()?.toLowerCase() || '';
        const marketPool = await scallopQuery.getMarketPool(coinName);

        supplied.push({
          coinType: col.coinType,
          amount: col.amount,
          apy: Number(marketPool?.supplyApy || 0),
        });
      } catch {
        // If can't get market info, add without APY
        supplied.push({
          coinType: col.coinType,
          amount: col.amount,
          apy: 0,
        });
      }
    }

    const borrowed =
      obligationData.debts?.map((debt) => ({
        coinType: debt.coinType,
        amount: debt.amount.toString(),
        apy: debt.borrowApy || 0,
      })) || [];

    const healthFactor = obligationData.healthFactor || 0;

    // Calculate total supplied value (sum of all collateral)
    const totalSuppliedValue = collateral.reduce((sum, col) => {
      return sum + parseFloat(col.amount);
    }, 0);

    return {
      supplied,
      borrowed,
      collateral,
      totalSuppliedValue: totalSuppliedValue.toString(),
      totalBorrowedValue: obligationData.borrowedValue?.toString() || '0',
      healthFactor: Number(healthFactor),
    };
  } catch (error) {
    console.error('Query lending position failed:', error);
    throw new Error(
      `Failed to query lending position: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function getMarketInfo(coinName: string): Promise<MarketInfo> {
  try {
    const scallop = await getScallopSdk();
    const scallopQuery = await scallop.createScallopQuery();

    const marketPool = await scallopQuery.getMarketPool(coinName);

    if (!marketPool) {
      throw new Error(`Market data not found for ${coinName}`);
    }

    const poolData = marketPool as unknown as PoolData;

    return {
      supplyApy: Number(marketPool.supplyApy || 0),
      borrowApy: Number(marketPool.borrowApy || 0),
      totalSupply: poolData.supply?.toString() || '0',
      totalBorrow: poolData.borrowed?.toString() || '0',
      utilizationRate: Number(marketPool.utilizationRate || 0),
      maxCollateralFactor: Number(poolData.maxCollateralFactor || 0),
    };
  } catch (error) {
    console.error('Query market info failed:', error);
    throw new Error(
      `Failed to query market info: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}
