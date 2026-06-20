# Soroban Voting App

Soroban Voting App is a simple decentralized polling application built on the Stellar ecosystem using Soroban smart contracts. This project allows users to create polls, vote for one of two available options, view voting results, and delete polls.

All poll data and vote counts are stored on-chain using Soroban contract storage.

## Project Overview

This project was created as a Stellar Soroban workshop submission. The smart contract is written in Rust and deployed on the Stellar Testnet.

The application is different from the basic Notes Contract example used during the hands-on session. Instead of storing notes, this contract stores polling data and provides voting functionality.

## Features

* Create a new poll with a question and two options
* View all existing polls stored on-chain
* Vote for option A or option B
* Track vote counts for each option
* Delete a poll by its ID
* Store poll data using Soroban instance storage

## Smart Contract

The smart contract is built using:

* Rust
* Soroban SDK
* Stellar CLI
* Soroban Studio

## Contract Name

```rust
VotingContract
```

## Data Structure

Each poll is stored using the following structure:

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

## Smart Contract Functions

### 1. `get_polls`

```rust
get_polls(env: Env) -> Vec<Poll>
```

Returns all polls stored in the contract.

This function is used to display all available polls and their current voting results.

### 2. `create_poll`

```rust
create_poll(env: Env, question: String, option_a: String, option_b: String) -> String
```

Creates a new poll with two voting options.

Initial vote count:

```text
votes_a = 0
votes_b = 0
```

Example:

```text
question: Favorite programming language?
option_a: Rust
option_b: JavaScript
```

### 3. `vote_poll`

```rust
vote_poll(env: Env, id: u64, choice: u32) -> String
```

Votes on a poll by ID.

Choice value:

```text
choice = 1 -> vote for option_a
choice = 2 -> vote for option_b
```

If the choice is not `1` or `2`, the contract returns:

```text
Invalid choice
```

If the poll ID is not found, the contract returns:

```text
Poll not found
```

### 4. `delete_poll`

```rust
delete_poll(env: Env, id: u64) -> String
```

Deletes a poll by its ID.

If the poll is found, the contract removes it from storage.
If the poll is not found, the contract returns:

```text
Poll not found
```

## Testnet Deployment

Network:

```text
Stellar Testnet
```

Contract ID:

```text
CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O
```

## Example Poll Data

Example poll created during testing:

```text
Question: Favorite programming language?
Option A: Rust
Option B: JavaScript
```

Initial result:

```text
votes_a: 0
votes_b: 0
```

After voting for option A:

```text
votes_a: 1
votes_b: 0
```

## How to Build

Run the following command from the contract project directory:

```bash
stellar contract build
```

## How to Deploy

Deploy the contract to Stellar Testnet using:

```bash
stellar contract deploy --source-account YOUR_WALLET_NAME --network testnet
```

Replace `YOUR_WALLET_NAME` with the wallet name configured in Stellar CLI.

After deployment, the command will return a Contract ID.

## How to Invoke the Contract

Replace the following values:

```text
CONTRACT_ID = your deployed contract ID
YOUR_WALLET_NAME = your Stellar CLI wallet name
```

### Get All Polls

```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  get_polls
```

### Create a Poll

```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  create_poll \
  --question "Favorite programming language?" \
  --option_a "Rust" \
  --option_b "JavaScript"
```

### Vote on a Poll

Vote for option A:

```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  vote_poll \
  --id 1 \
  --choice 1
```

Vote for option B:

```bash
stellar contract invoke \
  --id CONTRACT_ID \
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
  --id CONTRACT_ID \
  --source-account YOUR_WALLET_NAME \
  --network testnet \
  -- \
  delete_poll \
  --id 1
```

## Frontend Integration Plan

The smart contract is designed to be integrated with a frontend application.

Possible frontend flow:

1. User opens the voting app.
2. Frontend calls `get_polls()` to display all polls.
3. User creates a new poll using a form.
4. Frontend calls `create_poll(question, option_a, option_b)`.
5. User clicks a vote button.
6. Frontend calls `vote_poll(id, choice)`.
7. Frontend refreshes the poll list by calling `get_polls()`.
8. User can delete a poll by calling `delete_poll(id)`.

## Backend Integration Plan

A backend is not required for the MVP because the frontend can interact directly with the Soroban smart contract.

However, a backend can be added in the future for:

* Transaction logging
* User activity history
* Poll metadata indexing
* Faster query caching
* API integration for frontend applications

## Tech Stack

* Stellar
* Soroban
* Rust
* Soroban SDK
* Soroban Studio
* Stellar CLI
* Stellar Testnet

## Project Scope

This project is an MVP smart contract for a decentralized voting application.

Current scope:

* On-chain poll storage
* Two-option voting
* Vote counting
* Poll deletion

Out of scope for this version:

* Token transfer
* Wallet-based vote restriction
* One-user-one-vote validation
* Poll expiration time
* Multi-option polls
* Frontend UI
* Backend API

## Future Improvements

Possible improvements for the next version:

* Add wallet authentication
* Prevent the same wallet from voting multiple times
* Add poll expiration or deadline
* Support more than two voting options
* Add poll creator ownership
* Restrict delete access to the poll creator
* Build a frontend interface
* Add backend indexing for better data display

## License

This project is created for educational and workshop submission purposes.
