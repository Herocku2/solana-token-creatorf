'use client'
import { useNetwork } from "@/provider/AppWalletProvider";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";

export default function NetworkChanger() {
  const { network, setNetwork } = useNetwork();


  return (
    <div className="flex justify-center items-center gap-2">
      <button disabled={network === WalletAdapterNetwork.Devnet} className={` p-2 rounded-lg disabled:bg-neutral-700 disabled:border-neutral-700 disabled:text-white border border-neutral-500   hover:border-neutral-700 hover:text-white/70 transition-all ease-in-out duration-300 `} onClick={() => setNetwork(WalletAdapterNetwork.Devnet)}>
        {network === WalletAdapterNetwork.Devnet ? "Devnet Active" : "Use Devnet"}
      </button>
      <button disabled={network === WalletAdapterNetwork.Mainnet} className={` p-2 rounded-lg disabled:bg-neutral-700 disabled:border-neutral-700 disabled:text-white border border-neutral-500   hover:border-neutral-700 hover:text-white/70 transition-all ease-in-out duration-300 `} onClick={() => setNetwork(WalletAdapterNetwork.Mainnet)}>

        {network === WalletAdapterNetwork.Mainnet ? "Mainnet Active" : "Use Mainnet"}
      </button>
    </div>
  );
}