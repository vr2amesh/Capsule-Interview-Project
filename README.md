# Capsule-Interview-Project
 Multi-Sig Wallet with SDK
This project provides a multi-signature Ethereum wallet contract and an SDK for interacting with it.

Features
Multi-signature wallet: Transactions must be approved by multiple account holders before they can be executed.
SDK: Interact with the wallet from JavaScript.
Setup
Here's how to get started with this project:

Prerequisites
Node.js 14.x or later
npm 6.x or later
Installation
Clone the repository:

git clone https://github.com/yourusername/yourrepository.git

Install dependencies:

npm install
Compile contracts:

npx truffle compile
Testing
To run the project's tests, execute:

npx truffle test
Deployment
To deploy the contract, you'll need to migrate it to a network:

npx truffle migrate --network [network_name]

