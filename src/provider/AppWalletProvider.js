"use client";

import React, { useMemo, useState, createContext, useContext } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import * as walletAdapterWallets from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";


export const NetworkContext = createContext();
export const useNetwork = () => useContext(NetworkContext);


const CUSTOM_RPC_ENDPOINTS = {
  [WalletAdapterNetwork.Devnet]: "",
  [WalletAdapterNetwork.Mainnet]: process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC,
};

export default function AppWalletProvider({ children }) {
  const [network, setNetwork] = useState(WalletAdapterNetwork.Devnet);


  const endpoint = useMemo(() => {
    return CUSTOM_RPC_ENDPOINTS[network] || clusterApiUrl(network);
  }, [network]);


  const wallets = useMemo(
    () => [
      new walletAdapterWallets.PhantomWalletAdapter(),
      new walletAdapterWallets.TrustWalletAdapter(),
      new walletAdapterWallets.SafePalWalletAdapter(),
      new walletAdapterWallets.SolflareWalletAdapter(),
      new walletAdapterWallets.TorusWalletAdapter(),
    ],
    [network]
  );

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets}>
          <WalletModalProvider>
            {children}
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </NetworkContext.Provider>
  );
}
