export type MainTab = "lending" | "borrowing" | "staking" | "swap";
export type SubTab = "lending-pools" | "scoin-pools";

export interface LendingPool {
  coin: string;
  icon: string;
  price: number;
  yourSupply: number;
  totalSupply: number;
  totalBorrow: number;
  utilizationRate: number;
  apy: number;
  badge?: string;
}

export interface ScallopPool {
  coinName: string;
  symbol: string;
  coinType: string;
  sCoinType: string;
  marketCoinType: string;
  coinDecimal: number;
  coinPrice: number;
  borrowApr: number;
  borrowApy: number;
  supplyApr: number;
  supplyApy: number;
  supplyCoin: number;
  borrowCoin: number;
  reserveCoin: number;
  utilizationRate: number;
  supplyAmount: number;
  borrowAmount: number;
}

export interface ScallopCollateral {
  coinName: string;
  symbol: string;
  coinType: string;
  marketCoinType: string;
  coinDecimal: number;
  coinPrice: number;
  collateralFactor: number;
  depositAmount: number;
}

export interface ScallopMarketData {
  tvl: number;
  updatedAt: string;
  pools: ScallopPool[];
  collaterals: ScallopCollateral[];
}

export interface TabConfig {
  id: MainTab;
  label: string;
  component: React.ComponentType<TabContentProps>;
}

export interface SubTabConfig {
  id: SubTab;
  label: string;
}

export interface TabContentProps {
  searchQuery: string;
  apyFilter: string;
  marketData?: ScallopMarketData;
  loading?: boolean;
}
