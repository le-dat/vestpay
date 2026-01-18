'use client';

import { useState, useEffect, useRef } from 'react';
import type { CetusToken } from '@/lib/suilend/core/tokens';
import { fetchCetusTokens, getPopularTokens, searchTokens, sortTokens } from '@/lib/suilend/core/tokens';

interface TokenSelectorProps {
  selectedToken: CetusToken | null;
  onSelect: (token: CetusToken) => void;
  excludeToken?: CetusToken | null;
}

const TOKENS_PER_PAGE = 20;

function TokenIcon({ token, size = 'md' }: { token: CetusToken; size?: 'sm' | 'md' | 'lg' }) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  if (!token.logoURL || imageError) {
    return (
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#00d084] to-[#00c07a] flex items-center justify-center text-white font-black overflow-hidden`}>
        {token.symbol.charAt(0)}
      </div>
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-white flex items-center justify-center`}>
      <img
        src={token.logoURL}
        alt={token.symbol}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

export default function TokenSelector({ selectedToken, onSelect, excludeToken }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tokens, setTokens] = useState<CetusToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<CetusToken[]>([]);
  const [displayedTokens, setDisplayedTokens] = useState<CetusToken[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTokens();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = searchTokens(tokens, searchQuery);
      setFilteredTokens(results.filter(t => t.coinType !== excludeToken?.coinType));
    } else {
      const popular = getPopularTokens(tokens);
      const remaining = sortTokens(tokens.filter(t => !popular.includes(t)));
      const allFiltered = [...popular, ...remaining];
      setFilteredTokens(allFiltered.filter(t => t.coinType !== excludeToken?.coinType));
    }
    setPage(1);
  }, [searchQuery, tokens, excludeToken]);

  useEffect(() => {
    setDisplayedTokens(filteredTokens.slice(0, page * TOKENS_PER_PAGE));
  }, [filteredTokens, page]);

  useEffect(() => {
    if (!isOpen) {
      setPage(1);
      setSearchQuery('');
    }
  }, [isOpen]);

  async function loadTokens() {
    setLoading(true);
    try {
      const tokenList = await fetchCetusTokens();
      setTokens(tokenList);
      const popular = getPopularTokens(tokenList);
      const remaining = sortTokens(tokenList.filter(t => !popular.includes(t)));
      const allFiltered = [...popular, ...remaining];
      setFilteredTokens(allFiltered.filter(t => t.coinType !== excludeToken?.coinType));
    } catch (error) {
      console.error('Failed to load tokens:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(token: CetusToken) {
    onSelect(token);
    setIsOpen(false);
    setSearchQuery('');
  }

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (displayedTokens.length < filteredTokens.length) {
        setPage(prev => prev + 1);
      }
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-50 dark:bg-white/5 p-2 pr-4 pl-3 rounded-full border border-gray-100 dark:border-white/10 hover:border-[#00d084]/50 transition-all shadow-sm group"
      >
        {selectedToken ? (
          <>
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white">
              <TokenIcon token={selectedToken} size="md" />
            </div>
            <span className="font-black text-[18px] text-[#111827] dark:text-white">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-[#64748b] font-bold">Select</span>
        )}
        <svg className="w-5 h-5 text-[#94a3b8] group-hover:text-[#111827] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Showing {displayedTokens.length} of {filteredTokens.length} tokens
            </div>
          </div>

          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="overflow-y-auto flex-1"
          >
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            ) : displayedTokens.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No tokens found
              </div>
            ) : (
              <>
                {displayedTokens.map((token) => (
                  <button
                    key={token.coinType}
                    onClick={() => handleSelect(token)}
                    className="w-full px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 transition-colors"
                  >
                    <TokenIcon token={token} size="md" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-xs text-gray-500">{token.name}</div>
                    </div>
                  </button>
                ))}
                {displayedTokens.length < filteredTokens.length && (
                  <div className="flex items-center justify-center py-4">
                    <svg className="animate-spin h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

