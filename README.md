# Solana Token Creator

Solana Token Creator is a web application that allows users to create their very own Solana-based tokens or meme coins with ease. By simply connecting their wallets, users can customize their token's parameters such as name, symbol, supply, decimals, and description, as well as upload a token logo. Additionally, users have the flexibility to choose token metadata options, like setting it as mutable, or renouncing the mint and freeze authority. Best of all, token creation is free aside from the usual transaction fees on the Solana network.

With this tool, you can now also **view your assets (tokens and NFTs)** on both the Solana Devnet and Mainnet after connecting your wallet.

## Demo

[Solana Token Creator](https://solana-token-creator-xerxes.vercel.app/)


## Features

- **Wallet Connection:** Securely connect your Solana wallet.
- **Customizable Token Parameters:** Define the token name, symbol, total supply, decimals, and description.
- **Logo Upload:** Add a custom logo to represent your token.
- **Metadata Options:** Choose whether to make token metadata mutable or to renounce mint and freeze authority.
- **Cost-Effective:** Create tokens free of charge aside from the transaction fee on the Solana network.
- **Asset Viewer:** View all your tokens and NFTs on either the Solana Devnet or Mainnet after connecting your wallet.


## Viewing Your Assets on Devnet and Mainnet
Once you've connected your Solana wallet to the application, you can seamlessly view all your tokens and NFTs on either the Solana Devnet or Mainnet. This feature allows you to:

- Explore Your Holdings: Get a comprehensive overview of your digital assets.
- Switch Networks: Easily toggle between Devnet and Mainnet to view assets across different clusters.
- Stay Organized: Manage and monitor your tokens and NFTs in one place.
This functionality ensures that you always have full visibility into your Solana ecosystem, empowering you to make informed decisions about your digital assets.


## Environment Variables
**Important:** To use Mainnet without any error, please use a custom rpc endpoint

Also to use the uplaod function im using [FileBase](filebase.com)

sign up and fill up the info
```bash
NEXT_PUBLIC_SOLANA_MAINNET_RPC=YOUR CUSTOM RPC
NEXT_PUBLIC_FILEBASE_KEY=YOUR FILEBASE KEY
NEXT_PUBLIC_FILEBASE_SECRET=YOUR FILEBASE SECRET
NEXT_PUBLIC_FILEBASE_BUCKETNAME=YOUR FILEBASE BUCKETNAME
NEXT_PUBLIC_FILEBASE_GATEWAY=https://YOURFIREBASEGATEWAY/ipfs
```

## Prerequisites

Before running this project locally, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or above)
- [Yarn](https://yarnpkg.com/) or [npm](https://www.npmjs.com/)
- A Solana wallet (e.g., [Phantom Wallet](https://phantom.app/)) for testing

## Getting Started

Follow these steps to set up the project on your local machine:

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/solana-token-creator.git
cd solana-token-creator
```

### 2. Install Dependencies

Using Yarn:

```bash
yarn install
```

Or using npm:

```bash
npm install
```



### 3. Run the Project

Using Yarn:

```bash
yarn start
```

Or using npm:

```bash
npm start
```

Your application should now be running locally on [http://localhost:3000](http://localhost:3000).



## Contributing

Contributions are welcome! If you have any suggestions or improvements, please feel free to submit a pull request or open an issue.

## Contact
Happy token creating! If you have any questions or feedback, please feel free to reach out.

- **Telegram**: [@xerxescoder](https://t.me/xerxescoder)
- **Telegram Channel**: [@xerxescodes](https://t.me/xerxescodes)
- **Email**: [xerxescode@gmail.com](mailto:xerxescode@gmail.com)

## License

This project is open source and available under the [MIT License](LICENSE).


