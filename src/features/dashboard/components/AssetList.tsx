"use client";

import { CoinIcon } from "@/features/wallet";
import { formatCoinBalance } from "@/shared/utils";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

// Types
interface Token {
  coinType: string;
  symbol: string;
  iconUrl?: string;
  balanceFormatted: string;
}

interface TokenListProps {
  coins: Token[];
  coinValues: Record<string, number>;
  loading?: boolean;
}

// Asset Name Mapping
const SYMBOL_TO_NAME: Record<string, string> = {
  SUI: "Sui",
  ETH: "Ethereum",
  SOL: "Solana",
  USDC: "USD Coin",
  WBTC: "Wrapped Bitcoin",
};

// Extracts canonical chain for a given symbol/coinType
function getChainLabel(symbol: string, coinType: string): string {
  const upper = symbol.toUpperCase();
  if (upper === "SUI" || coinType.startsWith("0x2::sui::SUI")) return "Sui";
  if (upper === "ETH" || upper === "WETH") return "Ethereum";
  if (upper === "SOL") return "Solana";
  if (upper === "USDC" || upper === "WBTC") {
    if (coinType.includes("sui")) return "Sui";
    if (coinType.includes("eth")) return "Ethereum";
  }
  return "Sui";
}

function getTokenDisplayName(symbol: string): string {
  return SYMBOL_TO_NAME[symbol.toUpperCase()] || symbol;
}

// Header component
function TokenListHeader({
  search,
  onSearch,
}: {
  search: string;
  onSearch: (q: string) => void;
}) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <h2 className="text-xl font-medium text-gray-900">Your Assets</h2>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tokens..."
            value={search}
            onChange={e => onSearch(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary/30 focus:bg-white transition-all"
          />
        </div>
      </div>
    </div>
  );
}

// Table row for a token
function TokenRow({
  token,
  usdValue,
  displayName,
  animateIndex,
}: {
  token: Token;
  usdValue: number;
  displayName: string;
  animateIndex: number;
}) {
  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animateIndex * 0.05 }}
      key={token.coinType}
      className="hover:bg-gray-50 rounded-xl transition-all cursor-pointer group"
    >
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-3">
          <CoinIcon
            iconUrl={token.iconUrl}
            symbol={token.symbol}
            size="md"
            variant="primary"
          />
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-0.5">{displayName}</p>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{token.symbol}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4 align-middle">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {formatCoinBalance(token.balanceFormatted)}
          </p>
          <p className="text-xs text-gray-500">≈ ${usdValue.toFixed(2)}</p>
        </div>
      </td>
    </motion.tr>
  );
}

// Table of tokens or empty state
function TokenTableBody({
  tokens,
  values,
  search,
}: {
  tokens: Token[];
  values: Record<string, number>;
  search: string;
}) {
  if (tokens.length === 0) {
    return (
      <tr>
        <td colSpan={2} className="text-center py-12">
          <p className="text-sm text-gray-400">
            No assets found matching &quot;{search}&quot;
          </p>
        </td>
      </tr>
    );
  }

  return (
    <>
      {tokens.map((token, i) => {
        const usdValue = values[token.symbol] || 0;
        const displayName = getTokenDisplayName(token.symbol);
        return (
          <TokenRow
            key={token.coinType}
            token={token}
            usdValue={usdValue}
            displayName={displayName}
            animateIndex={i}
          />
        );
      })}
    </>
  );
}

// Main list
export default function TokenList({ coins, coinValues, loading }: TokenListProps) {
  const [search, setSearch] = useState("");

  const suiTokens = useMemo(() => {
    const primary = coins.filter(
      coin => getChainLabel(coin.symbol, coin.coinType) === "Sui"
    );
    if (!search.trim()) return primary;
    const q = search.toLowerCase();
    return primary.filter(
      coin =>
        coin.symbol.toLowerCase().includes(q) ||
        coin.coinType.toLowerCase().includes(q)
    );
  }, [coins, search]);

  if (loading || coins.length === 0) return null;

  return (
    <section className="flex flex-col gap-4 w-full">
      <TokenListHeader search={search} onSearch={setSearch} />
      <div className="bg-white rounded-3xl border border-gray-300 w-full">
        <div className="overflow-x-auto rounded-3xl">
          <table className="min-w-full table-fixed">
            <colgroup>
              <col style={{ width: "40%" }} />
              <col style={{ width: "30%" }} />
            </colgroup>
            <thead className="bg-gray-100">
              <tr>
                <th
                  className="px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-left"
                >
                  Asset
                </th>
                <th
                  className="px-6 py-4 text-xs font-semibold text-neutral-600 uppercase tracking-wider text-left"
                >
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              <TokenTableBody
                tokens={suiTokens}
                values={coinValues}
                search={search}
              />
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}