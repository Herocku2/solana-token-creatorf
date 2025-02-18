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

export default function UserForm() {
  const { connection } = useConnection();
  const { wallet, connected } = useWallet();
  const [isFetching, setIsFetching] = useState(false);
  const [userCluster, setUserCluster] = useState(null);
  const [userTokens, setUserTokens] = useState([]);


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
      setUserCluster(userNetwork);
      const myTokens = await fetchAllDigitalAssetWithTokenByOwner(
        umi,
        umi.identity.publicKey
      );

      console.log(myTokens)
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
    if (userTokens.length == 0) {
      getMyAssets();
    }
  }, [connected]);

  return (
    <div className="w-full flex flex-col  justify-center items-center border-t-2 border-neutral-400 pt-4 gap-5">
      <h1 className="text-2xl text-cyan-600">Current Network: {userCluster}</h1>

      <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4 justify-items-center items-center justify-center">
        {userTokens.length > 0 && userTokens.map((token, index) => (
          <div key={index} className="flex flex-col justify-center items-start gap-2 border border-neutral-500 p-4 rounded-xl w-full">
            <p className="text-xs md:text-sm text-cyan-400 border-b w-full pb-2">
              {tokenTypes[token?.metadata?.tokenStandard?.value]}
            </p>
            <p className="text-sm md:text-base">
              {token?.metadata?.name} <span className="text-xs md:text-sm">({token?.metadata?.symbol})</span>
            </p>

            {tokenTypes[token?.metadata?.tokenStandard?.value] == "Token" ? (
              <p className="text-sm md:text-base">
                Supply: {Number(Number(token?.mint?.supply) / 10 ** Number(token?.mint?.decimals)).toLocaleString("en-US")}
              </p>
            ) : (
              <p className="text-sm md:text-base">
                Supply: {Number(token?.edition?.maxSupply.value).toLocaleString("en-US")}
              </p>
            )}

            <p className="text-sm md:text-base">
              Your Asset: {Number(Number(token?.token?.amount) / 10 ** Number(token?.mint?.decimals)).toLocaleString("en-US")}
            </p>
            <p className="text-sm md:text-base">
              Is Mutable:  {token?.metadata?.isMutable ? "Yes" : "No"}
            </p>
            <a className="underline  hover:text-cyan-200 transition-all ease-in-out hover:underline-offset-4" target="_blank" href={`https://solscan.io/address/${token?.metadata?.updateAuthority}${userCluster == 'devnet' && '?cluster=devnet'}`}>
              Update Authority
            </a>

            {!token?.mint?.mintAuthority?.value ? (
              <p className="text-sm md:text-base">
                Mint Authority: N/A
              </p>
            ) : (
              <a className="underline  hover:text-cyan-200 transition-all ease-in-out hover:underline-offset-4" target="_blank" href={`https://solscan.io/address/${token?.mint?.mintAuthority?.value}${userCluster == 'devnet' && '?cluster=devnet'}`}>
                Mint Authority
              </a>
            )}
            {!token?.mint?.freezeAuthority?.value ? (
              <p className="text-sm md:text-base">
                Freeze Authority: N/A
              </p>
            ) : (
              <a className="underline  hover:text-cyan-200 transition-all ease-in-out hover:underline-offset-4" target="_blank" href={`https://solscan.io/address/${token?.mint?.freezeAuthority?.value}${userCluster == 'devnet' && '?cluster=devnet'}`}>
                Freeze Authority
              </a>
            )}


            <div className="flex justify-center items-center gap-5">
              <a className="underline  hover:text-cyan-200 transition-all ease-in-out hover:underline-offset-4" target="_blank" href={`https://solscan.io/address/${token?.token?.owner}${userCluster == 'devnet' && '?cluster=devnet'}`}>
                Owner
              </a>
              <a className="underline  hover:text-cyan-200 transition-all ease-in-out hover:underline-offset-4" target="_blank" href={`https://solscan.io/token/${token?.token?.mint}${userCluster == 'devnet' && '?cluster=devnet'}`}>
                SolScan
              </a>
            </div>
          </div>


        ))}
      </div>

    </div>
  );
}
