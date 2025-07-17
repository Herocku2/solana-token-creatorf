"use client";

import React, { useMemo, useState, createContext, useContext, useCallback } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

// Create context with default values
export const NetworkContext = createContext({
  network: WalletAdapterNetwork.Devnet,
  setNetwork: () => {},
});

// Custom hook for accessing network context
export const useNetwork = () => useContext(NetworkContext);

// Importar utilidad de endpoints
import { getBestEndpoint, SOLANA_ENDPOINTS } from '@/utils/solanaEndpoints';

// Connection config with better performance settings
const connectionConfig = {
  commitment: 'confirmed',
  confirmTransactionInitialTimeout: 60000, // 60 seconds
  disableRetryOnRateLimit: false,
  httpHeaders: {
    'Content-Type': 'application/json',
  }
};

export default function AppWalletProvider({ children }) {
  // Network state with persistent storage
  const [network, setNetworkState] = useState(() => {
    // Try to get from localStorage if available
    if (typeof window !== 'undefined') {
      const savedNetwork = localStorage.getItem('solana-network');
      return savedNetwork === WalletAdapterNetwork.Mainnet 
        ? WalletAdapterNetwork.Mainnet 
        : WalletAdapterNetwork.Devnet;
    }
    return WalletAdapterNetwork.Devnet;
  });

  // Memoized network setter with localStorage persistence
  const setNetwork = useCallback((newNetwork) => {
    setNetworkState(newNetwork);
    if (typeof window !== 'undefined') {
      localStorage.setItem('solana-network', newNetwork);
    }
  }, []);

  // Memoized endpoint based on selected network with fallback
  const endpoint = useMemo(() => {
    // Usar el primer endpoint de la lista como predeterminado
    // El sistema de fallback se encargará de cambiar si es necesario
    return SOLANA_ENDPOINTS[network]?.[0] || clusterApiUrl(network);
  }, [network]);

  // Memoized wallet adapters - only recreate when network changes
  const wallets = useMemo(() => [
    new walletAdapterWallets.PhantomWalletAdapter(),
    new walletAdapterWallets.SolflareWalletAdapter(),
    new walletAdapterWallets.TrustWalletAdapter(),
    new walletAdapterWallets.SafePalWalletAdapter(),
    new walletAdapterWallets.TorusWalletAdapter(),
  ], []);

  // Network context value
  const networkContextValue = useMemo(() => ({
    network,
    setNetwork
  }), [network, setNetwork]);

  return (
    <NetworkContext.Provider value={networkContextValue}>
      <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
        <WalletProvider wallets={wallets} autoConnect={false}>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </NetworkContext.Provider>
  );
}
