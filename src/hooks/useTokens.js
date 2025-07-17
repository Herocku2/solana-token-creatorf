import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNetwork } from "@/provider/AppWalletProvider";
import { fetchAllDigitalAssetWithTokenByOwner, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import logger from '@/utils/logger';

// Fetcher function para SWR
const fetcher = async (key, connection, wallet, network) => {
  if (!connection || !wallet || !wallet.adapter || !network) {
    return [];
  }
  
  try {
    logger.info('Fetching tokens', { network });
    
    const umi = createUmi(connection)
      .use(mplTokenMetadata())
      .use(mplToolbox())
      .use(walletAdapterIdentity(wallet.adapter));
    
    const tokens = await fetchAllDigitalAssetWithTokenByOwner(
      umi,
      umi.identity.publicKey
    );
    
    logger.info('Tokens fetched successfully', { count: tokens.length });
    return tokens;
  } catch (error) {
    logger.error('Error fetching tokens', { error: error.message });
    throw error;
  }
};

/**
 * Hook personalizado para obtener tokens con caché
 * @returns {Object} Estado de los tokens y funciones
 */
export function useTokens() {
  const { connection } = useConnection();
  const { wallet, connected } = useWallet();
  const { network } = useNetwork();
  const [isLoading, setIsLoading] = useState(false);
  
  // Clave única para SWR que incluye la red y la dirección del wallet
  const swrKey = connected && wallet ? 
    ['tokens', network, wallet.adapter?.publicKey?.toString()].join('-') : 
    null;
  
  // Usar SWR para cachear los resultados
  const { 
    data: tokens, 
    error, 
    mutate: refreshTokens 
  } = useSWR(
    swrKey,
    () => fetcher(swrKey, connection, wallet, network),
    { 
      revalidateOnFocus: false,
      dedupingInterval: 30000, // 30 segundos
      focusThrottleInterval: 60000, // 1 minuto
      errorRetryCount: 3
    }
  );
  
  // Función para forzar una recarga de tokens
  const fetchTokens = async () => {
    if (!connected) {
      return { success: false, message: 'Wallet not connected' };
    }
    
    setIsLoading(true);
    try {
      await refreshTokens();
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { 
        success: false, 
        message: error.message || 'Failed to fetch tokens' 
      };
    }
  };
  
  // Limpiar tokens cuando cambia la red
  useEffect(() => {
    if (connected) {
      refreshTokens();
    }
  }, [network, connected, refreshTokens]);
  
  return {
    tokens: tokens || [],
    isLoading: isLoading || (!error && !tokens && connected),
    error,
    fetchTokens,
    refreshTokens
  };
}