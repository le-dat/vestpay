"use client";

import { createContext, useContext, useMemo, ReactNode } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

interface NetworkContextType {
  client: SuiClient;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => new SuiClient({ url: getFullnodeUrl("mainnet") }), []);

  return (
    <NetworkContext.Provider value={{ client }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within NetworkProvider");
  }
  return context;
}
