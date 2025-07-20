"use client";

import React, { useMemo, useState, createContext, useContext, useCallback, useEffect } from "react";
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
  // Default to Devnet initially to avoid hydration mismatch
  const [network, setNetworkState] = useState(WalletAdapterNetwork.Devnet);
  
  // Handle localStorage in useEffect to avoid hydration issues
  useEffect(() => {
    // Only access localStorage after component is mounted on client
    const savedNetwork = localStorage.getItem('solana-network');
    if (savedNetwork === WalletAdapterNetwork.Mainnet) {
      setNetworkState(WalletAdapterNetwork.Mainnet);
    }
  }, []);

  // Memoized network setter with localStorage persistence
  const setNetwork = useCallback((newNetwork) => {
    setNetworkState(newNetwork);
    localStorage.setItem('solana-network', newNetwork);
  }, []);

  // Estado para almacenar el endpoint actual
  const [endpoint, setEndpoint] = useState(SOLANA_ENDPOINTS[network]?.[0] || clusterApiUrl(network));
  
  // Efecto para actualizar el endpoint cuando cambia la red
  useEffect(() => {
    const updateEndpoint = async () => {
      try {
        // Intentar obtener el mejor endpoint disponible
        const bestEndpoint = await getBestEndpoint(network);
        setEndpoint(bestEndpoint);
        console.log(`Using best endpoint for ${network}:`, bestEndpoint);
      } catch (error) {
        // Si falla, usar el primer endpoint de la lista
        const fallbackEndpoint = SOLANA_ENDPOINTS[network]?.[0] || clusterApiUrl(network);
        setEndpoint(fallbackEndpoint);
        console.warn(`Failed to get best endpoint, using fallback:`, fallbackEndpoint);
      }
    };
    
    updateEndpoint();
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
