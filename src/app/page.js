"use client";

import NetworkChanger from "@/components/NetworkChanger";
import TokenForm from "@/components/TokenForm";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Image, Sparkles } from "lucide-react";
import Link from "next/link";


export default function Home() {
  const { connection } = useConnection();
  const { wallet, publicKey, connected } = useWallet();

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">FlorkaFun Token Creator</h1>
          </div>
          <div className="flex gap-3">
            <Link
              className="gradient-button-secondary flex justify-center items-center px-4 py-2 text-sm font-medium"
              href={"/mytokens"}
            >
              <Image className="w-4 h-4 mr-2" />
              Your Assets
            </Link>
          </div>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">FlorkaFun Token Creator</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Create SPL tokens on Solana with automatic fee handling via Supabase
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletMultiButton
            style={{
              borderRadius: 12,
              background: "linear-gradient(to right, #8b5cf6, #ec4899)",
              border: "none",
              fontWeight: "600",
              padding: "12px 24px"
            }}
          />
        </div>

        {/* Network Changer */}
        <div className="flex justify-center mb-8">
          <NetworkChanger />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto">
        <TokenForm />
      </div>
    </main>
  );
}
