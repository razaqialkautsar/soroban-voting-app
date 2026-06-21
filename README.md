# Soroban Voting App

Soroban Voting App is a simple decentralized polling application built with Stellar Soroban. It lets users create polls, fetch on-chain poll data, vote for one of two options, and delete a poll by ID.

The smart contract is written in Rust with the Soroban SDK, and the frontend is built with React + Vite. The frontend connects directly to the deployed Soroban contract on Stellar Testnet and uses Freighter Wallet to sign write transactions.

## Why This Is Different From the Basic Contract Example

This project is not just a simple data storage contract. It models a voting workflow with structured poll data, two voting options, vote counters, and update/delete operations.

Instead of only storing plain user content, the contract manages:

- Poll IDs
- Poll questions
- Two voting options
- Vote counts for each option
- Vote updates through `vote_poll`
- Poll deletion by ID

This makes the project closer to a real interactive dApp workflow where the frontend reads contract state and sends signed transactions for state-changing actions.

## Features

- Create a poll with a question, option A, and option B
- Fetch all polls from the deployed Soroban contract
- Vote for option A or option B
- Delete a poll by ID
- Store poll data and vote counts on-chain
- Connect Freighter Wallet
- Disconnect wallet
- Display the connected wallet address
- Show transaction status and feedback in the UI
- Sign write transactions with Freighter Wallet
- Interact with Stellar Testnet

## Tech Stack

- Stellar
- Soroban
- Rust
- Soroban SDK
- Stellar CLI
- Stellar Testnet
- React
- Vite
- TypeScript
- Freighter Wallet

## Project Structure

```text
soroban-voting-app/
├── contracts/
│   └── voting/
│       ├── src/
│       │   └── lib.rs
│       ├── Cargo.toml
│       └── Makefile
├── frontend/
│   ├── bindings/
│   │   └── index.ts
│   ├── src/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── Cargo.toml
├── Cargo.lock
└── README.md
```

## Smart Contract Overview

The voting smart contract stores a list of polls in Soroban contract storage. Each poll contains a question, two answer options, and vote counters for both options.

Each poll uses this structure:

```rust
pub struct Poll {
    pub id: u64,
    pub question: String,
    pub option_a: String,
    pub option_b: String,
    pub votes_a: u64,
    pub votes_b: u64,
}
```

The contract exposes functions to create, read, update, and delete poll data.

## Smart Contract Functions

### `create_poll(question, option_a, option_b)`

Creates a new poll with a question and two voting options.

```rust
create_poll(env: Env, question: String, option_a: String, option_b: String) -> String
```

Initial vote counts are set to zero:

```text
votes_a = 0
votes_b = 0
```

### `get_polls()`

Returns all polls stored by the contract.

```rust
get_polls(env: Env) -> Vec<Poll>
```

This is a read operation. The frontend uses it to display the current poll list and vote counts.

### `vote_poll(id, choice)`

Votes on a poll by ID.

```rust
vote_poll(env: Env, id: u64, choice: u32) -> String
```

Choice values:

```text
1 = vote for option_a
2 = vote for option_b
```

### `delete_poll(id)`

Deletes a poll by ID.

```rust
delete_poll(env: Env, id: u64) -> String
```

If the poll exists, it is removed from contract storage.

## Testnet Deployment Information

Network:

```text
Stellar Testnet
```

Network passphrase:

```text
Test SDF Network ; September 2015
```

RPC URL:

```text
https://soroban-testnet.stellar.org
```

Deployed contract ID:

```text
CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O
```

## Frontend Integration

The React frontend imports the generated TypeScript bindings from `frontend/bindings`. It creates a contract client with:

- The deployed contract ID
- Stellar Testnet network passphrase
- Stellar Testnet RPC URL
- The connected Freighter wallet public key
- A `signTransaction` function that calls Freighter

Read operations such as `get_polls()` can be simulated and displayed without submitting a transaction.

Write operations such as `create_poll`, `vote_poll`, and `delete_poll` require a Freighter signature. When the user clicks a write action button, Freighter opens a confirmation popup. After approval, the frontend submits the signed transaction to Stellar Testnet.

A backend is not required for this MVP because the frontend interacts directly with the deployed Soroban contract.

## How to Run the Smart Contract Locally

Install the Rust target used by Soroban contracts:

```bash
rustup target add wasm32v1-none
```

Run contract tests from the project root:

```bash
cargo test
```

You can also run tests from the contract folder:

```bash
cd contracts/voting
cargo test
```

## How to Build the Contract

From the project root:

```bash
cd contracts/voting
stellar contract build
```

Or use the included Makefile:

```bash
cd contracts/voting
make build
```

The compiled WASM file will be generated under:

```text
target/wasm32v1-none/release/
```

## How to Deploy the Contract

Configure and fund a Stellar CLI wallet for Testnet before deploying. Use `YOUR_WALLET_NAME` as the placeholder for your local Stellar CLI identity.

```bash
stellar keys generate --global YOUR_WALLET_NAME --network testnet
```

Deploy the compiled contract to Stellar Testnet:

```bash
cd contracts/voting
stellar contract deploy \
  --wasm target/wasm32v1-none/release/voting.wasm \
  --source-account YOUR_WALLET_NAME \
  --network testnet
```

The command returns a contract ID. This project currently uses:

```text
CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O
```

## How to Generate TypeScript Bindings

Generate TypeScript bindings from the deployed Testnet contract:

```bash
stellar contract bindings typescript \
  --contract-id CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O \
  --network testnet \
  --output-dir frontend/bindings
```

The frontend imports the generated client from:

```text
frontend/bindings/index.ts
```

If you regenerate bindings after changing the Rust contract, update the frontend method calls to match the generated client method names.

## How to Run the Frontend

Install dependencies:

```bash
cd frontend
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set the deployed contract ID in `frontend/.env`:

```text
VITE_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
VITE_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
VITE_STELLAR_CONTRACT_ID=CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O
```

Start the Vite dev server:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

## How to Use the App

1. Install Freighter Wallet in your browser.
2. Switch Freighter to Stellar Testnet.
3. Open the frontend app.
4. Click `Connect Freighter`.
5. Confirm wallet access in Freighter.
6. Click `Get Polls` to fetch polls from the deployed contract.
7. Click `Create Sample Poll` to create a sample poll.
8. Approve the transaction in Freighter.
9. Click `Vote Rust` or `Vote JavaScript` to vote for option A or option B.
10. Approve the vote transaction in Freighter.
11. Click `Delete Poll ID 1` to delete poll ID 1.
12. Approve the delete transaction in Freighter.

The app displays basic status feedback after each action.

## Example Invoke Commands Using Stellar CLI

Use the deployed Testnet contract ID:

```text
CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O
```

### Get All Polls

```bash
stellar contract invoke \
  --id CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  get_polls
```

### Create a Poll

```bash
stellar contract invoke \
  --id CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  create_poll \
  --question "Favorite programming language?" \
  --option_a "Rust" \
  --option_b "JavaScript"
```

### Vote for Option A

```bash
stellar contract invoke \
  --id CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  vote_poll \
  --id 1 \
  --choice 1
```

### Vote for Option B

```bash
stellar contract invoke \
  --id CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  vote_poll \
  --id 1 \
  --choice 2
```

### Delete a Poll

```bash
stellar contract invoke \
  --id CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  delete_poll \
  --id 1
```

## Future Improvements

- Add custom poll creation form fields in the UI
- Support more than two options per poll
- Add wallet-based vote restrictions
- Prevent duplicate voting from the same wallet
- Add poll expiration time
- Add poll owner authorization for deletion
- Improve frontend loading and error states
- Add event indexing or off-chain caching for faster reads
- Add more contract unit tests
- Add UI tests for wallet and transaction flows

## License and Educational Purpose

This project was created for educational purposes and workshop submission. It is intended as a learning project for building a basic full-stack Stellar Soroban dApp with Rust smart contracts, React, Vite, and Freighter Wallet.
