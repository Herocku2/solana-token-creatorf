'use client'

import NetworkChanger from "@/components/NetworkChanger";
import UserForm from "@/components/UserForm";
import {WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SquarePen, Wallet, Sparkles } from "lucide-react";
import Link from "next/link";

export default function MyTokens() {
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <section className="container space-y-8 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center items-center my-12 relative z-10">
        {/* Hero Section */}
        <div className="gradient-card p-8 w-full max-w-4xl text-center space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-600 to-cyan-600 rounded-2xl">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold gradient-text">
              Your Digital Assets
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
          </div>
          
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Connect your wallet to view all your tokens and NFTs on the Solana network. 
            Whether you're on Mainnet or Devnet, this tool fetches and displays your assets 
            seamlessly. Explore your holdings, manage your collections, and stay in control 
            of your digital assets with ease.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <WalletMultiButton
              style={{
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                border: 'none',
                fontWeight: '600',
                padding: '12px 24px',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
              }}
            />
            
            <Link
              className="gradient-button-secondary flex justify-center items-center text-white font-semibold px-6 py-3 hover:scale-105 transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl"
              href={"/"}
            >
              <SquarePen className="w-5 h-5 mr-2" />
              Create Token
            </Link>
          </div>

          {/* Network Changer */}
          <div className="pt-4">
            <NetworkChanger />
          </div>
        </div>

        {/* Assets Section */}
        <div className="w-full animate-slide-up">
          <UserForm />
        </div>
      </section>
    </main>
  );
}
