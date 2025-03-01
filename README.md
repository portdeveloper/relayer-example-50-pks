# Scaffold-ETH 2 + Monad Testnet Config + A Simple Relayer with 50 Private Keys

A high-performance transaction relayer system built on Scaffold-ETH 2, configured for Monad Testnet.

## 🏗 About

This project demonstrates how to implement a high-throughput transaction relayer system with multiple private keys for parallel transaction processing. Built on top of Scaffold-ETH 2, it provides a simple yet powerful example of off-chain transaction management with on-chain execution.

## 🚀 How It Works

- The relayer uses multiple private keys to send transactions in parallel
- When you click "Increment", the request is queued on the server, which is a simple nextjs api route
- Available private keys are assigned to process transactions from the queue
- Each transaction calls the `increment()` function on the YourContract
- This architecture allows for high throughput without transaction conflicts

## 🏄‍♂️ Getting Started

Prerequisites: [Node.js](https://nodejs.org/en/) (>=18.18.0), [Yarn](https://yarnpkg.com/getting-started/install) (>=3.2.3), [Git](https://git-scm.com/downloads), [Foundry](https://book.getfoundry.sh/getting-started/installation)

```bash
# Clone the repository
git clone https://github.com/portdeveloper/relayer-example-50-pks.git

# Install dependencies
yarn install

# Navigate to foundry package
cd packages/foundry

# Install foundry dependencies
forge install

# Open a new terminal

# Start the development server
yarn start
```

Visit your app at: http://localhost:3000

## 📝 Project Structure

- **packages/nextjs**: Frontend application built with Next.js
- **packages/foundry**: Smart contracts and deployment scripts

## 🔐 Using the Relayer

This project demonstrates a high-throughput transaction relayer system:

- Configure private keys in `.env` file (see `.env.example`)
- The relayer automatically processes transaction requests from the queue
- Customize the relayer logic in `packages/nextjs/api/relayer/increment/route.ts`

## 🛠️ Customizing Smart Contracts

- Edit contracts in `packages/foundry/contracts`
- Deploy to your local node (anvil) with `yarn deploy`
- Deploy to Monad Testnet with `yarn deploy --network monad_testnet`
- Test with `yarn test`

## 🤝 Need Help?

- Check out the [Scaffold-ETH 2 Documentation](https://docs.scaffoldeth.io) for Scaffold-ETH 2 related questions
- Join [Monad Developer Discord](https://discord.gg/monaddev) for any questions related to Monad

## 📦 Tech Stack

- **Blockchain Development**: Foundry (Solidity)
- **Frontend**: Next.js, React, TailwindCSS
- **Ethereum Interactions**: wagmi, viem
- **Development Environment**: Scaffold-ETH 2
- **Network**: Monad Testnet

## 🔍 Features

- Simple counter contract with increment functionality
- Relayer system with 50 private keys for transaction handling
- Clean and intuitive UI for interacting with the blockchain
- Real-time block number updates
- Transaction tracking

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ using [Scaffold-ETH 2](https://github.com/scaffold-eth/scaffold-eth-2)

