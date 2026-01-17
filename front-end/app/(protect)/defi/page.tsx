"use client";

import { BorrowingTabContent } from "@/components/defi/BorrowingTabContent";
import { LendingTabContent } from "@/components/defi/LendingTabContent";
import { useScallopMarket } from "@/lib/hooks/useScallopMarket";
import { MainTab, TabConfig } from "@/lib/types/defi";
import { RefreshCw, Search } from "lucide-react";
import { useState } from "react";

const MAIN_TABS: TabConfig[] = [
  { id: "lending", label: "LENDING", component: LendingTabContent },
  { id: "borrowing", label: "BORROWING", component: BorrowingTabContent },
];

const DeFiPage = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("lending");
  const [searchQuery, setSearchQuery] = useState("");
  const [apyFilter, setApyFilter] = useState("APY");
  const { data: marketData, loading, refresh } = useScallopMarket();

  const ActiveTabComponent = MAIN_TABS.find((tab) => tab.id === activeMainTab)?.component;

  return (
    <div className="space-y-6">
      {/* Main Content Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Main Tab Navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveMainTab(tab.id)}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                  activeMainTab === tab.id
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center justify-end gap-3 mb-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="e.g SCA"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </div>

          {/* APY Filter */}
          <select
            value={apyFilter}
            onChange={(e) => setApyFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
          >
            <option>APY</option>
            <option>Utilization</option>
            <option>Supply</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => refresh()}
            disabled={loading}
            className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Active Tab Content */}
        {ActiveTabComponent && (
          <ActiveTabComponent
            searchQuery={searchQuery}
            apyFilter={apyFilter}
            marketData={marketData || undefined}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default DeFiPage;
