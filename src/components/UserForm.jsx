"use client";

import { useEffect, useState } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import {
  fetchAllDigitalAssetWithTokenByOwner,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import { mplToolbox } from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromWalletAdapter,
  walletAdapterIdentity,
} from "@metaplex-foundation/umi-signer-wallet-adapters";
import { generateSigner } from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import NetworkChanger from "./NetworkChanger";
import { useNetwork } from "@/provider/AppWalletProvider";
import { Wallet } from "lucide-react";

export default function UserForm() {
  const { connection } = useConnection();
  const { wallet, connected } = useWallet();
  const [isFetching, setIsFetching] = useState(false);
  const [userTokens, setUserTokens] = useState([]);
  const { network } = useNetwork();


  const tokenTypes = {
    0: "NFT",
    1: "FungibleAsset",
    2: "Token",
    3: "NonFungibleEdition",
    4: "ProgrammableNonFungible",
  };


  const getMyAssets = async () => {
    if (!connected) {
      toast.warning("Please connect wallet first");
      return;
    }
    try {
      toast.loading("Fetching Assets....")
      setIsFetching(true)
      const umi = createUmi(connection)
        .use(mplTokenMetadata())
        .use(mplToolbox())
        .use(walletAdapterIdentity(wallet.adapter));

      const mintSigner = generateSigner(umi);
      const userSigner = createSignerFromWalletAdapter(wallet.adapter);
      const userNetwork = umi.rpc.getCluster();
      const myTokens = await fetchAllDigitalAssetWithTokenByOwner(
        umi,
        umi.identity.publicKey
      );

      toast.dismiss();
      toast.success(`${myTokens.length} Assset fetched`)
      setUserTokens(myTokens);
    } catch (error) {
      toast.dismiss();
      console.log(error);
      toast.error(error.message);
    } finally {
      setIsFetching(false);
    }
  };



  useEffect(() => {
    setUserTokens([]);
  }, [network]);



  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      {/* Fetch Button */}
      <div className="w-full max-w-md">
        <button 
          disabled={userTokens.length > 0 || isFetching} 
          className={`w-full gradient-button flex items-center justify-center gap-3 py-4 text-lg font-semibold transition-all duration-300 ${
            (userTokens.length > 0 || isFetching) 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:scale-105 hover:shadow-xl'
          }`} 
          onClick={() => getMyAssets()}
        >
          {isFetching ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Fetching Assets...
            </>
          ) : userTokens.length > 0 ? (
            <>
              <span className="text-green-300">✓</span>
              Assets Loaded
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Fetch My Assets
            </>
          )}
        </button>
      </div>

      {/* Assets Grid */}
      {userTokens.length > 0 && (
        <div className="w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg">
              <span className="text-white font-bold">{userTokens.length}</span>
            </div>
            <h3 className="text-2xl font-bold text-white">Assets Found</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {userTokens.map((token, index) => (
              <div key={index} className="gradient-card p-6 hover:scale-[1.02] transition-all duration-300 group">
                {/* Token Type Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tokenTypes[token?.metadata?.tokenStandard?.value] === 'Token' 
                      ? 'bg-green-600/20 text-green-300 border border-green-500/30'
                      : 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {tokenTypes[token?.metadata?.tokenStandard?.value]}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    {token?.metadata?.isMutable ? (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" title="Mutable"></span>
                    ) : (
                      <span className="w-2 h-2 bg-green-500 rounded-full" title="Immutable"></span>
                    )}
                  </div>
                </div>

                {/* Token Info */}
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-white truncate">
                      {token?.metadata?.name || 'Unknown Token'}
                    </h4>
                    {token?.metadata?.symbol && (
                      <p className="text-gray-400 text-sm">
                        Symbol: {token?.metadata?.symbol}
                      </p>
                    )}
                  </div>

                  {/* Supply Info */}
                  <div className="space-y-2">
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Supply</p>
                      <p className="text-white font-semibold">
                        {tokenTypes[token?.metadata?.tokenStandard?.value] === "Token" ? 
                          Number(Number(token?.mint?.supply) / 10 ** Number(token?.mint?.decimals)).toLocaleString("en-US") :
                          Number(token?.edition?.maxSupply?.value || 1).toLocaleString("en-US")
                        }
                      </p>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Your Balance</p>
                      <p className="text-cyan-300 font-semibold">
                        {Number(Number(token?.token?.amount) / 10 ** Number(token?.mint?.decimals)).toLocaleString("en-US")}
                      </p>
                    </div>
                  </div>

                  {/* Authority Status */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {!token?.mint?.mintAuthority?.value ? (
                        <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs border border-green-500/30">
                          🔒 Mint Renounced
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs border border-yellow-500/30">
                          ⚠️ Mint Active
                        </span>
                      )}
                      
                      {!token?.mint?.freezeAuthority?.value ? (
                        <span className="px-2 py-1 bg-green-600/20 text-green-300 rounded text-xs border border-green-500/30">
                          ❄️ Freeze Renounced
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-600/20 text-yellow-300 rounded text-xs border border-yellow-500/30">
                          ⚠️ Freeze Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700/50">
                    <a 
                      className="text-cyan-400 hover:text-cyan-300 text-xs font-medium hover:underline transition-colors duration-200" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      href={`https://solscan.io/token/${token?.token?.mint}${network === 'devnet' ? '?cluster=devnet' : ''}`}
                    >
                      View on Solscan
                    </a>
                    
                    <span className="text-gray-600">•</span>
                    
                    <a 
                      className="text-cyan-400 hover:text-cyan-300 text-xs font-medium hover:underline transition-colors duration-200" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      href={`https://solscan.io/address/${token?.token?.owner}${network === 'devnet' ? '?cluster=devnet' : ''}`}
                    >
                      Owner Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
