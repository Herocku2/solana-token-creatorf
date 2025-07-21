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
import { Send, Upload, Coins } from "lucide-react";
import { uploadImageToS3, uploadJsonToS3 } from "@/helpers/filebase";
import SafeContent from "@/components/SafeContent";
import logger from "@/utils/logger";

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
    
    // Validation checks
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
    
    // Create toast ID for better management
    const toastId = "create-token-toast";

    try {
      setisCreating(true);
      toast.dismiss();
      
      // Initialize UMI with proper error handling
      let umi;
      try {
        umi = createUmi(connection)
          .use(mplTokenMetadata())
          .use(mplToolbox())
          .use(walletAdapterIdentity(wallet.adapter));
      } catch (umiError) {
        logger.error("Failed to initialize UMI", { error: umiError });
        toast.error("Failed to initialize blockchain connection. Please try again.");
        return;
      }
      
      const mintSigner = generateSigner(umi);
      const userSigner = createSignerFromWalletAdapter(wallet.adapter);
      const userNetwork = umi.rpc.getCluster();
      setUserCluster(userNetwork);
      
      // Calculate supply with BigInt to handle large numbers safely
      let finalSupply;
      try {
        // Validate inputs
        if (!Number.isFinite(Number(formData.supply)) || !Number.isFinite(Number(formData.decimals))) {
          throw new Error("Supply or decimals is not a valid number");
        }
        
        if (Number(formData.supply) <= 0) {
          throw new Error("Supply must be greater than 0");
        }
        
        // Use BigInt for calculation to handle large numbers
        const supplyBigInt = BigInt(Math.floor(Number(formData.supply)));
        const decimalMultiplier = BigInt(10) ** BigInt(Number(formData.decimals));
        finalSupply = supplyBigInt * decimalMultiplier;
        
        // Convert back to number for compatibility with the rest of the code
        // This is safe because we'll use the BigInt value directly for the blockchain operation
        if (finalSupply <= BigInt(0)) {
          throw new Error("Invalid supply calculation");
        }
      } catch (error) {
        logger.error("Supply calculation error", { error, supply: formData.supply, decimals: formData.decimals });
        throw new Error("Invalid supply calculation: " + error.message);
      }

      // Upload image with proper error handling
      toast.loading(`Uploading Token Logo...`, { id: toastId });
      let ImageCID;
      try {
        const imageName = `image-${formData.name.replace(/[^a-zA-Z0-9]/g, '')}-${formData.symbol.replace(/[^a-zA-Z0-9]/g, '')}`;
        ImageCID = await uploadImageToS3(imageName, formData.image);
        if (!ImageCID) throw new Error("Failed to upload image");
      } catch (uploadError) {
        logger.error("Image upload error", { error: uploadError });
        toast.error("Failed to upload token logo. Please try again.", { id: toastId });
        throw new Error("Image upload failed");
      }

      // Create and upload metadata
      toast.loading(`Uploading Token Metadata...`, { id: toastId });
      let metadataCID;
      try {
        const tokenMetadata = {
          name: formData.name,
          symbol: formData.symbol,
          description: formData.description,
          image: ImageCID,
        };
        
        const metadataName = `metadata-${formData.name.replace(/[^a-zA-Z0-9]/g, '')}-${formData.symbol.replace(/[^a-zA-Z0-9]/g, '')}`;
        metadataCID = await uploadJsonToS3(tokenMetadata, metadataName);
        if (!metadataCID) throw new Error("Failed to upload metadata");
      } catch (metadataError) {
        logger.error("Metadata upload error", { error: metadataError });
        toast.error("Failed to upload token metadata. Please try again.", { id: toastId });
        throw new Error("Metadata upload failed");
      }

      // Create token on blockchain
      toast.loading(`Creating ${formData.name} (${formData.symbol}) on ${userNetwork}`, {
        id: toastId,
        description: `Confirm Transaction on your wallet...`,
      });

      try {
        // Build transaction with all instructions
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

        // Set a timeout for the transaction
        const txPromise = createFungibleIx
          .add(createTokenIx)
          .add(mintTokensIx)
          .add(setFreezeAuthorityIx)
          .add(setMintAuthorityIx)
          .add(
            addMemo(umi, {
              memo: "Token Created by Solana Token Creator",
            })
          ).sendAndConfirm(umi);
          
        // Execute transaction with timeout
        const txBuilder = await Promise.race([
          txPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("Transaction timed out")), 60000))
        ]);
        
        const txHash = base58.deserialize(txBuilder.signature)[0];
        
        // Success notification
        toast.dismiss(toastId);
        toast.success("Token created successfully", {
          description: (
            <div className="flex flex-col gap-1">
              <div className="flex gap-2 mt-1">
                <a
                  href={`https://solscan.io/token/${mintSigner.publicKey.toString()}${userNetwork === "devnet" ? "?cluster=devnet" : ""}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  View on Solscan
                </a>
                <a
                  href={`https://solscan.io/tx/${txHash}${userNetwork === "devnet" ? "?cluster=devnet" : ""}`}
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
      } catch (txError) {
        logger.error("Transaction error", { error: txError });
        toast.error(txError.message || "Transaction failed. Please try again.", { id: toastId });
        throw new Error("Transaction failed");
      }
    } catch (error) {
      toast.dismiss(toastId);
      logger.error("Token creation error", { error });
      toast.error(error.message || "Failed to create token", {
        duration: 5000,
      });
    } finally {
      setisCreating(false);
    }
  };


  return (
    <div className="w-full flex flex-col justify-center items-center gap-8">
      <div className="w-full max-w-5xl">
        <div className="gradient-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold gradient-text">Token Configuration</h2>
          </div>

          <form onSubmit={createToken} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  Token Name
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., AI DEGENS"
                  className="input-field w-full"
                />
                {errors.name && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span>⚠</span> {errors.name}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  The display name of your token (1-32 characters)
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                  Symbol
                  <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleChange}
                  placeholder="e.g., AIDEGEN"
                  className="input-field w-full"
                />
                {errors.symbol && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span>⚠</span> {errors.symbol}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Short ticker symbol (1-10 characters)
                </p>
              </div>
            </div>

            {/* Token Economics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200">Decimals</label>
                <input
                  type="number"
                  name="decimals"
                  value={formData.decimals}
                  onChange={handleChange}
                  placeholder="9"
                  className="input-field w-full"
                  min="0"
                  max="9"
                />
                {errors.decimals && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span>⚠</span> {errors.decimals}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Precision level (0-9). Standard is 9 for most tokens
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-200">Total Supply</label>
                <input
                  type="number"
                  name="supply"
                  value={Number(formData.supply)}
                  onChange={handleChange}
                  placeholder="1000000"
                  className="input-field w-full"
                  min="1"
                />
                {errors.supply && (
                  <p className="text-red-400 text-xs flex items-center gap-1">
                    <span>⚠</span> {errors.supply}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  Total tokens to mint to your wallet
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                Description
                <span className="text-red-400">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your token's purpose, utility, and vision..."
                className="input-field w-full h-24 resize-none"
              />
              {errors.description && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Detailed description (minimum 10 characters)
              </p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                Token Logo
                <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="image"
                  onChange={handleChange}
                  accept="image/jpeg,image/png,image/gif"
                  className="input-field w-full file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
              </div>
              {errors.image && (
                <p className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.image}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Upload PNG, JPG, or GIF (recommended: 512x512px)
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-blue-500/20 rounded-full mt-1">
                  <span className="text-blue-400 text-sm">ℹ</span>
                </div>
                <div className="text-sm text-gray-300">
                  <p className="font-semibold text-blue-300 mb-2">Token Security Features:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Mint Authority:</strong> Automatically renounced (no more tokens can be created)</li>
                    <li>• <strong>Freeze Authority:</strong> Automatically renounced (tokens cannot be frozen)</li>
                    <li>• <strong>Metadata:</strong> Set to immutable (cannot be changed)</li>
                    <li>• <strong>DEX Ready:</strong> Fully compatible with decentralized exchanges</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                disabled={isCreating}
                type="submit"
                className={`gradient-button flex items-center gap-3 px-8 py-4 text-lg font-semibold transition-all duration-300 ${
                  isCreating 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:scale-105 hover:shadow-xl'
                }`}
              >
                {isCreating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Token...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Create Token
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Token Preview */}
      <div className="w-full max-w-5xl">
        <div className="gradient-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Token Preview</h3>
          </div>
          
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Token Logo */}
            <div className="flex-shrink-0">
              {formData.image ? (
                <div className="relative">
                  <Image
                    src={URL.createObjectURL(formData.image)}
                    alt="Token Logo"
                    width={120}
                    height={120}
                    className="object-cover rounded-2xl border-2 border-gray-600/50"
                    loading="eager"
                    priority={true}
                  />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                </div>
              ) : (
                <div className="w-[120px] h-[120px] bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-500" />
                </div>
              )}
            </div>

            {/* Token Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-2xl font-bold text-white">
                    {formData.name || "Token Name"}
                  </h4>
                  {formData.symbol && (
                    <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-sm font-medium border border-purple-500/30">
                      {formData.symbol}
                    </span>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm leading-relaxed">
                  {formData.description || "Token description will appear here..."}
                </p>
              </div>

              {/* Token Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Total Supply</p>
                  <p className="text-white text-lg font-semibold">
                    {Number(formData.supply).toLocaleString("en-US")}
                  </p>
                </div>
                
                <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Decimals</p>
                  <p className="text-white text-lg font-semibold">
                    {formData.decimals}
                  </p>
                </div>
              </div>

              {/* Security Features */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-green-600/20 text-green-300 rounded-full text-xs font-medium border border-green-500/30">
                  🔒 Mint Authority Renounced
                </span>
                <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs font-medium border border-blue-500/30">
                  ❄️ Freeze Authority Renounced
                </span>
                <span className="px-3 py-1 bg-purple-600/20 text-purple-300 rounded-full text-xs font-medium border border-purple-500/30">
                  🛡️ Immutable Metadata
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
