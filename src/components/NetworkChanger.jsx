'use client'
import { useNetwork } from "@/provider/AppWalletProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Wifi, Globe } from "lucide-react";

export default function NetworkChanger() {
  const { network, setNetwork } = useNetwork();

  return (
    <div className="flex justify-center items-center gap-3 p-1 bg-gray-800/30 rounded-xl border border-gray-700/50 backdrop-blur-sm">
      <button 
        disabled={network === WalletAdapterNetwork.Devnet} 
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
          network === WalletAdapterNetwork.Devnet 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`} 
        onClick={() => setNetwork(WalletAdapterNetwork.Devnet)}
      >
        <Wifi className="w-4 h-4" />
        {network === WalletAdapterNetwork.Devnet ? "Devnet Active" : "Devnet"}
      </button>
      
      <button 
        disabled={network === WalletAdapterNetwork.Mainnet} 
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ease-in-out ${
          network === WalletAdapterNetwork.Mainnet 
            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg' 
            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
        }`} 
        onClick={() => setNetwork(WalletAdapterNetwork.Mainnet)}
      >
        <Globe className="w-4 h-4" />
        {network === WalletAdapterNetwork.Mainnet ? "Mainnet Active" : "Mainnet"}
      </button>
    </div>
  );
}