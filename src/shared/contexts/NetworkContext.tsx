"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";

type Network = "testnet" | "devnet" | "mainnet";

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  client: SuiClient;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [network, setNetworkState] = useState<Network>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sui_network") as Network;
      if (saved && ["testnet", "devnet", "mainnet"].includes(saved)) {
        return saved;
      }
    }
    return "mainnet";
  });

  const [client, setClient] = useState<SuiClient>(() => {
    const initialNetwork =
      typeof window !== "undefined"
        ? (localStorage.getItem("sui_network") as Network) || "mainnet"
        : "mainnet";
    const validNetwork = ["testnet", "devnet", "mainnet"].includes(initialNetwork)
      ? initialNetwork
      : "mainnet";
    return new SuiClient({ url: getFullnodeUrl(validNetwork) });
  });

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork);
    setClient(new SuiClient({ url: getFullnodeUrl(newNetwork) }));
    if (typeof window !== "undefined") {
      localStorage.setItem("sui_network", newNetwork);
    }
  };

  return (
    <NetworkContext.Provider value={{ network, setNetwork, client }}>
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
