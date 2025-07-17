"use client";

import { memo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Image, Sparkles } from "lucide-react";
import Link from "next/link";
import logger from '@/utils/logger';

// Importar componentes con lazy loading
const NetworkChanger = dynamic(() => import("@/components/NetworkChanger"), {
  loading: () => <div className="h-10 w-48 bg-gray-700/50 animate-pulse rounded-lg"></div>,
  ssr: false
});

const TokenForm = dynamic(() => import("@/components/TokenForm"), {
  loading: () => (
    <div className="w-full max-w-5xl mx-auto">
      <div className="gradient-card p-8 animate-pulse">
        <div className="h-8 bg-gray-700/50 w-64 rounded-lg mb-8"></div>
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-24 bg-gray-700/50 rounded-lg"></div>
            <div className="h-24 bg-gray-700/50 rounded-lg"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-24 bg-gray-700/50 rounded-lg"></div>
            <div className="h-24 bg-gray-700/50 rounded-lg"></div>
          </div>
          <div className="h-32 bg-gray-700/50 rounded-lg"></div>
          <div className="h-24 bg-gray-700/50 rounded-lg"></div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

// Optimized Home component with performance improvements
const Home = memo(function Home() {
  // Log page visit
  logger.info('Home page visited');

  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start px-4 py-8">
      {/* Header */}
      <header className="w-full max-w-6xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold gradient-text">FlorkaFun Token Creator</h1>
          </div>
          <nav>
            <Link
              className="gradient-button-secondary flex justify-center items-center px-4 py-2 text-sm font-medium"
              href={"/mytokens"}
              prefetch={true}
            >
              <Image className="w-4 h-4 mr-2" />
              Your Assets
            </Link>
          </nav>
        </div>

        {/* Subtitle */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold mb-4">
            <span className="gradient-text">FlorkaFun Token Creator</span>
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Create SPL tokens on Solana with automatic fee handling
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
          <Suspense fallback={<div className="h-10 w-48 bg-gray-700/50 animate-pulse rounded-lg"></div>}>
            <NetworkChanger />
          </Suspense>
        </div>
      </header>

      {/* Main Content */}
      <div className="w-full max-w-6xl mx-auto">
        <Suspense fallback={<div className="h-96 w-full bg-gray-800/30 animate-pulse rounded-xl"></div>}>
          <TokenForm />
        </Suspense>
      </div>
    </main>
  );
});

export default Home;
