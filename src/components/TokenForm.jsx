'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import {
  createFungible,
  fetchAllDigitalAssetWithTokenByOwner,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  mintTokensTo,
  mplToolbox,
  getSplAssociatedTokenProgramId,
  setAuthority,
  AuthorityType,
  addMemo,
} from "@metaplex-foundation/mpl-toolbox";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromWalletAdapter,
  walletAdapterIdentity,
} from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  generateSigner,
  some,
  percentAmount,
  publicKey,
  none,
} from "@metaplex-foundation/umi";
import { base58 } from "@metaplex-foundation/umi/serializers";
import NetworkChanger from "./NetworkChanger";
import { Send } from "lucide-react";
import { uploadImageToS3, uploadJsonToS3 } from "@/helpers/filebase";

export default function TokenForm() {
  const { connection } = useConnection();
  const { wallet, connected } = useWallet();
  const [isCreating, setisCreating] = useState(false);
  const [userCluster, setUserCluster] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    symbol: "",
    description: "",
    decimals: 9,
    supply: 1000,
    image: undefined
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "checkbox") {
      setFormData((prevData) => ({ ...prevData, [name]: checked }));
    } else if (type === "file" && files && files[0]) {
      setFormData((prevData) => ({ ...prevData, [name]: files[0] }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 1) {
      newErrors.name = "Name must be at least 1 characters.";
    }

    if (formData.name.length > 32) {
      newErrors.name = "Name must be at max 32 characters.";
    }

    if (!formData.symbol || formData.symbol.length < 1) {
      newErrors.symbol = "Symbol must be at least 1 characters.";
    }
    if (formData.symbol.length > 10) {
      newErrors.symbol = "Symbol must be at max 10 characters.";
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters.";
    }

    if (formData.decimals < 0 || formData.decimals > 9) {
      newErrors.decimals = "Decimals must be between 0 and 9.";
    }

    if (formData.supply <= 0) {
      newErrors.supply = "Supply must be a positive number.";
    }

    if (formData.image) {
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(formData.image.type)) {
        newErrors.image = "Only JPEG, PNG, and GIF files are allowed.";
      }
    }
    if (!formData.image) {
      newErrors.image = "Please upload an image";
    }

    return newErrors;
  };

  const createToken = async (e) => {
    e.preventDefault();
    if (!connected) {
      toast.warning("Please connect wallet first");
      return;
    }
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});


    try {
      setisCreating(true);
      toast.dismiss();
      const umi = createUmi(connection)
        .use(mplTokenMetadata())
        .use(mplToolbox())
        .use(walletAdapterIdentity(wallet.adapter));
      const mintSigner = generateSigner(umi);
      const userSigner = createSignerFromWalletAdapter(wallet.adapter);
      const userNetwork = umi.rpc.getCluster();
      setUserCluster(userNetwork)
      const finalSupply =
        Number(formData.supply) * 10 ** Number(formData.decimals);



      toast.loading(`Uploading Metadata...`);
      const uploadImage = await uploadImageToS3(`image-${formData.name}-${formData.symbol}`, formData.image)
      const ImageCID = uploadImage;

      let tokenMetadata = {
        name: formData.name,
        symbol: formData.symbol,
        description: formData.description,
        image: ImageCID,
      };
      const uploadMetadata = await uploadJsonToS3(tokenMetadata, `metadata-${formData.name}-${formData.symbol}`);
      const metadataCID = uploadMetadata;

      toast.dismiss();
      toast.loading(`Creating ${formData.name} (${formData.symbol}) on ${userNetwork}`, {
        description: `Confirm Transaction on your wallet...`,
      });

      const createFungibleIx = createFungible(umi, {
        mint: mintSigner,
        name: formData.name,
        symbol: formData.symbol,
        uri: metadataCID,
        sellerFeeBasisPoints: percentAmount(0),
        decimals: some(formData.decimals),
        isMutable: false,
      });

      const createTokenIx = createTokenIfMissing(umi, {
        mint: mintSigner.publicKey,
        owner: umi.identity.publicKey,
        ataProgram: getSplAssociatedTokenProgramId(umi),
      });

      const tokenInstance = findAssociatedTokenPda(umi, {
        mint: mintSigner.publicKey,
        owner: umi.identity.publicKey,
      });

      const mintTokensIx = mintTokensTo(umi, {
        mint: mintSigner.publicKey,
        token: tokenInstance,
        amount: BigInt(finalSupply),
      });

      const setFreezeAuthorityIx = setAuthority(umi, {
        owned: mintSigner,
        owner: userSigner,
        authorityType: AuthorityType.FreezeAccount,
        newAuthority: null,
      });

      const setMintAuthorityIx = setAuthority(umi, {
        owned: mintSigner,
        owner: userSigner,
        authorityType: AuthorityType.MintTokens,
        newAuthority: null,
      });

      const txBuilder = await createFungibleIx
        .add(createTokenIx)
        .add(mintTokensIx)
        .add(setFreezeAuthorityIx)
        .add(setMintAuthorityIx)
        .add(
          addMemo(umi, {
            memo: "Token Created by Solana Token Creator || https://solana-token-creator-xerxes.vercel.app",
          })
        ).sendAndConfirm(umi);
      const txHash = base58.deserialize(txBuilder.signature)[0];
      console.log(txHash);
      toast.dismiss();
      toast.success("Token created successfully", {
        description: (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 mt-1">
              <a
                href={`https://solscan.io/token/${mintSigner.publicKey.toString()}${userNetwork == "devnet" && "?cluster=devnet"
                  }`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                View on Solscan
              </a>
              <a
                href={`https://solscan.io/tx/${txHash}${userNetwork == "devnet" && "?cluster=devnet"
                  }`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Transaction Hash
              </a>
            </div>
          </div>
        ),
      });
    } catch (error) {
      toast.dismiss();
      console.log(error);
      toast.error("Error", {
        duration: 3000,
      });
    } finally {
      setisCreating(false);
    }
  };


  return (
    <div className="w-full flex flex-col  justify-center items-center border-t-2 border-neutral-400 pt-4 gap-5">
      <div className="w-full max-w-4xl flex justify-center ">
        <form onSubmit={createToken} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="AI DEGENS"
                className="mt-1 px-3 py-2 border bg-transparent  border-neutral-500 rounded-xl focus:outline-none focus:ring focus:ring-neutral-700 w-full"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                The name of your token.
              </p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-white">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                placeholder="AIDEGEN"
                className="mt-1 px-3 py-2 border bg-transparent border-neutral-500 rounded-xl focus:outline-none focus:ring focus:ring-neutral-700 w-full"
              />
              {errors.symbol && (
                <p className="text-red-500 text-xs mt-1">{errors.symbol}</p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                A shorthand ticker symbol for your token.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-white">Decimals</label>
              <input
                type="number"
                name="decimals"
                value={formData.decimals}
                onChange={handleChange}
                placeholder="Decimals"
                className="mt-1 px-3 py-2 border bg-transparent border-neutral-500 rounded-xl focus:outline-none focus:ring focus:ring-neutral-700 w-full"
                min="0"
                max="9"
              />
              {errors.decimals && (
                <p className="text-red-500 text-xs mt-1">{errors.decimals}</p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                The number of decimals in your token. This can be from 0-9.
              </p>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-white">Supply</label>
              <input
                type="number"
                name="supply"
                value={Number(formData.supply)}
                onChange={handleChange}
                placeholder="Supply"
                className="mt-1 px-3 py-2 border bg-transparent border-neutral-500 focus:outline-none focus:ring focus:ring-neutral-700 w-full rounded-xl"
                min="0"
              />
              {errors.supply && (
                <p className="text-red-500 text-xs mt-1">{errors.supply}</p>
              )}
              <p className="text-xs text-gray-300 mt-1">
                This will mint the supply of your token to your wallet.
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="ai degens is a community of degens who are trying to make the world a better place"
              className="mt-1 px-3 py-2 border bg-transparent border-neutral-500  rounded-xl focus:outline-none focus:ring focus:ring-neutral-700 w-full h-20 resize-none"
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description}</p>
            )}
            <p className="text-xs text-gray-300 mt-1">
              Provide a detailed description of your token. This will help users
              understand its purpose.
            </p>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-white">Token Logo</label>
            <input
              type="file"
              name="image"
              onChange={handleChange}
              className="mt-1 px-3 py-2 border border-neutral-500 focus:outline-none focus:ring focus:ring-neutral-700 w-full bg-transparent  rounded-xl"
            />
            {errors.image && (
              <p className="text-red-500 text-xs mt-1">{errors.image}</p>
            )}
            <p className="text-xs text-gray-300 mt-1">
              Provide an image that represents the token and makes it
              recognizable. (Logo)
            </p>
          </div>
          <p className="text-base md:text-lg text-gray-100 mt-1">
            Tokens will be deployed with <b>mint</b> and <b>freeze</b> authority renounced and token metadata set to <b>immutable</b>, making the token immutable.
            <br />
            This is required for <b>DEX Trading and Liquidity Pools.</b>
          </p>


          {/* Submit Button */}
          <button
            disabled={isCreating}
            type="submit"
            className="flex justify-center  border border-neutral-500 hover:border-neutral-700  disabled:border-neutral-800 hover:text-white/70 items-center  disabled:text-white/15 transition-all duration-300 ease-in-out text-white font-bold py-2 px-4 rounded-xl w-32 "
          >
            <Send className="w-4 h-4 mr-2" /> Submit
          </button>
        </form>
      </div>

      <div className="flex flex-col justify-center items-start  bg-transparent text-white p-4 rounded-xl w-full max-w-4xl mt-5 border-neutral-500 border">
        <div className="flex justify-start items-center gap-5 w-full">
          {formData.image ? (
            <Image
              src={URL.createObjectURL(formData.image)}
              alt="Token Logo"
              width={100}
              height={100}
              className=" object-cover rounded-lg mb-2"
            />
          ) : (
            <div className="rounded-xl w-[100px] h-[100px] bg-gray-500/30 animate-pulse" />
          )}
          <div className="flex flex-col justify-center items-start">
            <div className="flex justify-center items-center gap-2">
              <p className="text-base md:text-lg font-semibold ">{formData.name}</p>
              {formData.symbol && (
                <p className="text-sm">({formData.symbol})</p>
              )}
            </div>
            <p className="text-xs">
              Supply:{" "}
              <span className="text-sm">
                {Number(formData.supply).toLocaleString("en-US")}
              </span>
            </p>

            <p className="text-xs">
              Decimals: <span className="text-sm">{formData.decimals}</span>
            </p>
          </div>
        </div>
        <p className="text-xs mt-2 break-all whitespace-normal line-clamp-3 ">{formData.description}</p>
      </div>
    </div>
  );
}
