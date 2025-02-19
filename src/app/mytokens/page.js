'use client'

import NetworkChanger from "@/components/NetworkChanger";
import UserForm from "@/components/UserForm";
import {WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function MyTokens() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start">
      <section className="container space-y-6 max-w-7xl w-full mx-auto p-4  flex flex-col justify-center items-center rounded-xl my-16">
        <div className="flex flex-col justify-center items-start gap-3">
          <h1 className="text-3xl font-bold">Your Tokens & NFTs</h1>
          <p className="tracking-wide leading-5">
            Connect your wallet to view all your tokens and NFTs on the Solana
            network. Whether you're on Mainnet or Devnet, this tool fetches and
            displays your assets seamlessly. Explore your holdings, manage your
            collections, and stay in control of your digital assets with ease.
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
              className="  border border-neutral-500  transition-all duration-300 ease-in-out text-white font-bold p-3 rounded-xl "
              href={"/"}
            >
              Create Token
            </Link>
          </div>
          <NetworkChanger/>
        </div>
       <UserForm/>
      </section>
    </main>
  );
}
