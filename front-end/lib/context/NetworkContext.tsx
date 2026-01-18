'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

type Network = 'testnet' | 'devnet' | 'mainnet';

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  client: SuiClient;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<Network>('mainnet');
  const [client, setClient] = useState<SuiClient>(
    new SuiClient({ url: getFullnodeUrl('mainnet') })
  );

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork);
    setClient(new SuiClient({ url: getFullnodeUrl(newNetwork) }));
    if (typeof window !== 'undefined') {
      localStorage.setItem('sui_network', newNetwork);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sui_network') as Network;
      if (saved && ['testnet', 'devnet', 'mainnet'].includes(saved)) {
        setNetwork(saved);
      }
    }
  }, []);

  return (
    <NetworkContext.Provider value={{ network, setNetwork, client }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }
  return context;
}
