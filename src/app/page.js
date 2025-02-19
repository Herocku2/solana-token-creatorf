"use client";

import NetworkChanger from "@/components/NetworkChanger";
import TokenForm from "@/components/TokenForm";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Image } from "lucide-react";
import Link from "next/link";


export default function Home() {
  const { connection } = useConnection();
  const { wallet, publicKey, connected } = useWallet();



  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start">
      <section className="container space-y-6 max-w-7xl w-full mx-auto p-4  flex flex-col justify-center items-center rounded-xl my-16">
        <div className="flex flex-col justify-center items-start gap-3">
          <h1 className="text-3xl font-bold">Create Solana Token</h1>
          <p className="tracking-wide leading-5">
            Create your own Solana tokens effortlessly with our user-friendly
            app! this tool simplifies the process of minting custom tokens on
            the Solana network. Customize your token's name, symbol, supply, and
            more, all within a few clicks.
          </p>
          <div className="flex gap-3">
            <WalletMultiButton
              style={{
                borderRadius: 15,
                background: "transparent",
                border: "1px solid #737373",

              }}
            />
            <Link
              className=" flex justify-center items-center  border border-neutral-500 hover:border-neutral-700 hover:text-white/70 transition-all duration-300 ease-in-out text-white font-bold p-3 rounded-xl "
              href={"/mytokens"}
            >
              <Image className="w-4 h-4 mr-2" />  Your Assets
            </Link>
          </div>
          <NetworkChanger />
        </div>
        <TokenForm />
      </section>
    </main>
  );
}
