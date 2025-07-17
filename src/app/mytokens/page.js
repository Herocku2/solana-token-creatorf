'use client'

import { memo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SquarePen, Wallet, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import logger from '@/utils/logger';

// Importar componentes con lazy loading
const NetworkChanger = dynamic(() => import("@/components/NetworkChanger"), {
  loading: () => <div className="h-10 w-48 bg-gray-700/50 animate-pulse rounded-lg mx-auto"></div>,
  ssr: false
});

const UserForm = dynamic(() => import("@/components/UserForm"), {
  loading: () => (
    <div className="w-full animate-pulse">
      <div className="w-full max-w-md mx-auto h-12 bg-gray-700/50 rounded-xl mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="gradient-card p-6 h-64"></div>
        ))}
      </div>
    </div>
  ),
  ssr: false
});

// Componente optimizado con memoización
const MyTokens = memo(function MyTokens() {
  // Log page visit
  logger.info('MyTokens page visited');
  
  return (
    <main className="w-full min-h-screen flex flex-col items-center justify-start relative overflow-hidden">
      {/* Background decorative elements - optimizados para rendimiento */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 left-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>
      
      {/* Back to Home Button */}
      <div className="w-full max-w-7xl mx-auto px-6 pt-6">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors duration-200 w-fit"
          prefetch={true}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      <section className="container space-y-8 max-w-7xl w-full mx-auto p-6 flex flex-col justify-center items-center my-8 relative z-10">
        {/* Hero Section */}
        <div className="gradient-card p-8 w-full max-w-4xl text-center space-y-6">
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
            seamlessly.
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
              prefetch={true}
            >
              <SquarePen className="w-5 h-5 mr-2" />
              Create Token
            </Link>
          </div>

          {/* Network Changer */}
          <div className="pt-4">
            <Suspense fallback={<div className="h-10 w-48 bg-gray-700/50 animate-pulse rounded-lg mx-auto"></div>}>
              <NetworkChanger />
            </Suspense>
          </div>
        </div>

        {/* Assets Section */}
        <div className="w-full">
          <Suspense fallback={<div className="w-full h-64 bg-gray-800/30 animate-pulse rounded-xl"></div>}>
            <UserForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
});

export default MyTokens;
