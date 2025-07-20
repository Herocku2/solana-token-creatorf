'use client'
import { useNetwork } from "@/provider/AppWalletProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Wifi, Globe } from "lucide-react";
import { useCallback, memo, useState } from "react";
import { getLatestBlockhash } from "@/utils/solanaRpcService";
import { getLatestBlockhash as getMainnetBlockhash } from "@/utils/solanaMainnetService";
import { SOLANA_ENDPOINTS } from "@/utils/solanaEndpoints";

// Memoized component to prevent unnecessary re-renders
const NetworkChanger = memo(function NetworkChanger() {
  const { network, setNetwork } = useNetwork();
  
  // Estado para manejar la carga
  const [isLoading, setIsLoading] = useState(false);
  
  // Memoized click handlers to prevent recreating functions on each render
  const handleDevnetClick = useCallback(async () => {
    if (network !== WalletAdapterNetwork.Devnet) {
      try {
        setIsLoading(true);
        // Verificar la conexión a través del proxy antes de cambiar la red
        const endpoint = SOLANA_ENDPOINTS[WalletAdapterNetwork.Devnet][0];
        await getLatestBlockhash(endpoint);
        setNetwork(WalletAdapterNetwork.Devnet);
      } catch (error) {
        console.error("Error connecting to Devnet:", error);
        // Intentar con el siguiente endpoint si falla
        try {
          const fallbackEndpoint = SOLANA_ENDPOINTS[WalletAdapterNetwork.Devnet][1];
          await getLatestBlockhash(fallbackEndpoint);
          setNetwork(WalletAdapterNetwork.Devnet);
        } catch (fallbackError) {
          console.error("Failed to connect to Devnet fallback:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    }
  }, [network, setNetwork]);
  
  const handleMainnetClick = useCallback(async () => {
    if (network !== WalletAdapterNetwork.Mainnet) {
      try {
        setIsLoading(true);
        // Verificar la conexión a través del proxy específico para Mainnet
        await getMainnetBlockhash();
        setNetwork(WalletAdapterNetwork.Mainnet);
      } catch (error) {
        console.error("Error connecting to Mainnet:", error);
        // Mostrar un mensaje de error al usuario
        alert("No se pudo conectar a la red principal de Solana. Por favor, inténtelo de nuevo más tarde.");
      } finally {
        setIsLoading(false);
      }
    }
  }, [network, setNetwork]);

  return (
    <div className="flex justify-center items-center gap-3 p-1 bg-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
      <button 
        disabled={network === WalletAdapterNetwork.Devnet || isLoading} 
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
          network === WalletAdapterNetwork.Devnet 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
            : isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`} 
        onClick={handleDevnetClick}
        aria-label="Switch to Devnet"
      >
        {isLoading && network !== WalletAdapterNetwork.Devnet ? (
          <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin mr-2"></div>
        ) : (
          <Wifi className="w-4 h-4" />
        )}
        {network === WalletAdapterNetwork.Devnet ? "Devnet Active" : "Devnet"}
      </button>
      
      <button 
        disabled={network === WalletAdapterNetwork.Mainnet || isLoading} 
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
          network === WalletAdapterNetwork.Mainnet 
            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
            : isLoading ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`} 
        onClick={handleMainnetClick}
        aria-label="Switch to Mainnet"
      >
        {isLoading && network !== WalletAdapterNetwork.Mainnet ? (
          <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin mr-2"></div>
        ) : (
          <Globe className="w-4 h-4" />
        )}
        {network === WalletAdapterNetwork.Mainnet ? "Mainnet Active" : "Mainnet"}
      </button>
    </div>
  );
});

export default NetworkChanger;