import type { CetusToken, CetusTokenResponse } from './types';

const CETUS_API_URL = 'https://api-sui.cetus.zone/v3/sui/clmm/verified_coins_info';
const CACHE_KEY = 'cetus_tokens_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

let tokenCache: CetusToken[] | null = null;
let cacheTimestamp = 0;

export async function fetchCetusTokens(): Promise<CetusToken[]> {
  const now = Date.now();
  
  if (tokenCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return tokenCache;
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { tokens, timestamp } = JSON.parse(cached);
        if ((now - timestamp) < CACHE_DURATION) {
          tokenCache = tokens;
          cacheTimestamp = timestamp;
          return tokens;
        }
      } catch (e) {
        console.error('Failed to parse cached tokens:', e);
      }
    }
  }

  try {
    const response = await fetch(CETUS_API_URL);
    const data: CetusTokenResponse = await response.json();
    
    if (data.code === 0 && data.data?.list) {
      tokenCache = data.data.list;
      cacheTimestamp = now;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          tokens: tokenCache,
          timestamp: now
        }));
      }
      
      return tokenCache;
    }
    
    throw new Error('Invalid response from Cetus API');
  } catch (error) {
    console.error('Failed to fetch Cetus tokens:', error);
    return tokenCache || [];
  }
}

export function getPopularTokens(tokens: CetusToken[]): CetusToken[] {
  const popularSymbols = ['SUI', 'USDC', 'USDT', 'WETH', 'WBTC', 'CETUS', 'DEEP'];
  
  return tokens
    .filter(token => popularSymbols.includes(token.symbol))
    .sort((a, b) => popularSymbols.indexOf(a.symbol) - popularSymbols.indexOf(b.symbol));
}

export function sortTokens(tokens: CetusToken[]): CetusToken[] {
  return tokens.sort((a, b) => {
    if (a.isVerified !== b.isVerified) {
      return a.isVerified ? -1 : 1;
    }
    return a.symbol.localeCompare(b.symbol);
  });
}

export function searchTokens(tokens: CetusToken[], query: string): CetusToken[] {
  const lowerQuery = query.toLowerCase();
  
  const results = tokens.filter(token => 
    token.symbol.toLowerCase().includes(lowerQuery) ||
    token.name.toLowerCase().includes(lowerQuery) ||
    token.coinType.toLowerCase().includes(lowerQuery)
  );
  
  return sortTokens(results);
}
