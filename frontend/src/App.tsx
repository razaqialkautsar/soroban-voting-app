import { useState } from "react";
import {
  isConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import type { ClientOptions } from "@stellar/stellar-sdk/contract";
import { Client } from "../bindings";

const CONTRACT_ID = "CBADFNON7JOPM3XK5DBEILJF4U4DT3KLWUSVJIGZUA3QBEKQD6GBJI3O";
const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
const RPC_URL = "https://soroban-testnet.stellar.org";

function stringifyPolls(value: unknown) {
  return JSON.stringify(
    value,
    (_key, item) => (typeof item === "bigint" ? item.toString() : item),
    2,
  );
}

function shortenId(value: string) {
  return `${value.slice(0, 8)}...${value.slice(-8)}`;
}

function createContractClient(walletAddress: string) {
  const options: ClientOptions = {
    contractId: CONTRACT_ID,
    networkPassphrase: NETWORK_PASSPHRASE,
      rpcUrl: RPC_URL,
      publicKey: walletAddress,
      signTransaction: async (xdr: string) => {
        const result = (await freighterSignTransaction(xdr, {
          networkPassphrase: NETWORK_PASSPHRASE,
          address: walletAddress,
        })) as
          | string
          | {
              signedTxXdr: string;
              signerAddress?: string;
              error?: { message: string };
            };

        if (typeof result === "string") {
          return { signedTxXdr: result };
        }

        if (result.error) {
          throw new Error(result.error.message);
        }

        return {
          signedTxXdr: result.signedTxXdr,
          signerAddress: result.signerAddress,
        };
      },
  };

  return new Client(options);
}

function App() {
  const [wallet, setWallet] = useState("");
  const [status, setStatus] = useState("");
  const [polls, setPolls] = useState<any>(null);

  async function connectFreighter() {
    try {
      const check = await isConnected();

      if (!check.isConnected) {
        throw new Error("Freighter is not installed");
      }

      const access = await requestAccess();

      if (access.error) {
        throw new Error(access.error.message);
      }

      setWallet(access.address);
      setStatus("Wallet connected successfully");
    } catch (error) {
      console.error(error);
      setStatus("Failed to connect wallet");
    }
  }

  function disconnectWallet() {
    setWallet("");
    setPolls(null);
    setStatus("Wallet disconnected");
  }

  async function getPolls() {
    try {
      if (!wallet) {
        throw new Error("Connect wallet first");
      }

      const client = createContractClient(wallet);
      const tx = await client.get_polls();

      setPolls(tx.result);
      setStatus("Polls loaded successfully");
    } catch (error) {
      console.error(error);
      setStatus("Failed to get polls");
    }
  }

  async function createPoll() {
    try {
      if (!wallet) {
        throw new Error("Connect wallet first");
      }

      const client = createContractClient(wallet);

      const tx = await client.create_poll({
        question: "Favorite programming language?",
        option_a: "Rust",
        option_b: "JavaScript",
      });

      await tx.signAndSend();

      setStatus("Poll created successfully");
      await getPolls();
    } catch (error) {
      console.error(error);
      setStatus("Failed to create poll");
    }
  }

  async function voteOptionA() {
    try {
      if (!wallet) {
        throw new Error("Connect wallet first");
      }

      const client = createContractClient(wallet);

      const tx = await client.vote_poll({
        id: BigInt(1),
        choice: 1,
      });

      await tx.signAndSend();

      setStatus("Voted for Rust");
      await getPolls();
    } catch (error) {
      console.error(error);
      setStatus("Failed to vote for option A");
    }
  }

  async function voteOptionB() {
    try {
      if (!wallet) {
        throw new Error("Connect wallet first");
      }

      const client = createContractClient(wallet);

      const tx = await client.vote_poll({
        id: BigInt(1),
        choice: 2,
      });

      await tx.signAndSend();

      setStatus("Voted for JavaScript");
      await getPolls();
    } catch (error) {
      console.error(error);
      setStatus("Failed to vote for option B");
    }
  }

  async function deletePoll() {
    try {
      if (!wallet) {
        throw new Error("Connect wallet first");
      }

      const client = createContractClient(wallet);

      const tx = await client.delete_poll({
        id: BigInt(1),
      });

      await tx.signAndSend();

      setStatus("Poll deleted successfully");
      await getPolls();
    } catch (error) {
      console.error(error);
      setStatus("Failed to delete poll");
    }
  }

  return (
    <main className="app-shell">
      <section className="app-card">
        <header className="app-header">
          <div>
            <div className="badge-row">
              <span className="network-badge">Stellar Testnet</span>
            </div>
            <h1>Soroban Voting App</h1>
            <p className="app-subtitle">
              Create polls, vote on-chain, and manage voting data through a
              deployed Soroban contract.
            </p>
          </div>
        </header>

        <div className="contract-panel">
          <span>Contract ID</span>
          <code title={CONTRACT_ID}>{shortenId(CONTRACT_ID)}</code>
        </div>

        <section className="app-section">
          <div className="section-heading">
            <h2>Wallet</h2>
            <p>Connect Freighter to sign voting transactions.</p>
          </div>

          {!wallet ? (
            <button className="button button-connect" onClick={connectFreighter}>
              Connect Freighter
            </button>
          ) : (
            <div className="wallet-card">
              <div>
                <span>Connected wallet</span>
                <code title={wallet}>{shortenId(wallet)}</code>
              </div>
              <button
                className="button button-secondary"
                onClick={disconnectWallet}
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </section>

        <section className="app-section">
          <div className="section-heading">
            <h2>Contract Actions</h2>
            <p>Run read and write calls against the deployed contract.</p>
          </div>

          <div className="actions-grid">
            <button className="button button-primary" onClick={getPolls}>
              Get Polls
            </button>
            <button className="button button-primary" onClick={createPoll}>
              Create Sample Poll
            </button>
            <button className="button button-success" onClick={voteOptionA}>
              Vote Rust
            </button>
            <button className="button button-success" onClick={voteOptionB}>
              Vote JavaScript
            </button>
            <button className="button button-danger" onClick={deletePoll}>
              Delete Poll ID 1
            </button>
          </div>
        </section>

        <section className="app-section">
          <div className="section-heading">
            <h2>Status</h2>
          </div>
          <div className={`status-alert ${status ? "is-active" : ""}`}>
            {status || "No action yet. Connect your wallet to begin."}
          </div>
        </section>

        <section className="app-section">
          <div className="section-heading">
            <h2>Polls Result</h2>
            <p>Latest response returned by the contract read call.</p>
          </div>
          <pre className="result-block">
            <code>{polls ? stringifyPolls(polls) : "No polls loaded yet."}</code>
          </pre>
        </section>
      </section>
    </main>
  );
}

export default App;
