'use client'
import { useNetwork } from "@/provider/AppWalletProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export default function NetworkChanger() {
  const { network, setNetwork } = useNetwork();


  return (
    <div className="flex justify-center items-center gap-2">
      <button disabled={network === WalletAdapterNetwork.Devnet} className={` p-2 rounded-lg disabled:bg-transparent border border-slate-500 disabled:text-white bg-cyan-400 hover:bg-cyan-300 transition-all ease-in-out duration-500 text-black`} onClick={() => setNetwork(WalletAdapterNetwork.Devnet)}>
        {network === WalletAdapterNetwork.Devnet ? "Devnet Active" : "Use Devnet"}
      </button>
      <button disabled={network === WalletAdapterNetwork.Mainnet} className={` p-2 rounded-lg disabled:bg-transparent border border-slate-500 disabled:text-white bg-lime-400 hover:bg-lime-300 transition-all ease-in-out duration-500 text-black`} onClick={() => setNetwork(WalletAdapterNetwork.Mainnet)}>

        {network === WalletAdapterNetwork.Mainnet ? "Mainnet Active" : "Use Mainnet"}
      </button>
    </div>
  );
}