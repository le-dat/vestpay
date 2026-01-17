'use client';

import { useEffect, useState } from 'react';
import { isRecentlyAuthenticated } from '@/lib/sui/passkey-cache';

export default function AuthStatusIndicator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(isRecentlyAuthenticated(30000));
    };

    checkAuth();
    const interval = setInterval(checkAuth, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>Authenticated - No passkey prompt needed for next 30s</span>
    </div>
  );
}
