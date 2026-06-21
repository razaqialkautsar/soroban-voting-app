import { useState } from "react";
import {
  isConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import type { ClientOptions } from "@stellar/stellar-sdk/contract";
import { Client } from "../bindings";
import type { Poll } from "../bindings";

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

function toContractId(id: Poll["id"]) {
  return BigInt(id.toString());
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
  const [polls, setPolls] = useState<Poll[] | null>(null);
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");

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

      const nextQuestion = question.trim();
      const nextOptionA = optionA.trim();
      const nextOptionB = optionB.trim();

      if (!nextQuestion || !nextOptionA || !nextOptionB) {
        throw new Error("Fill all poll fields first");
      }

      const client = createContractClient(wallet);

      const tx = await client.create_poll({
        question: nextQuestion,
        option_a: nextOptionA,
        option_b: nextOptionB,
      });

      await tx.signAndSend();

      setQuestion("");
      setOptionA("");
      setOptionB("");
      setStatus("Poll created successfully");
      await getPolls();
    } catch (error) {
      console.error(error);
      setStatus("Failed to create poll");
    }
  }

  async function votePoll(id: Poll["id"], choice: 1 | 2) {
    try {
      if (!wallet) {
        throw new Error("Connect wallet first");
      }

      const client = createContractClient(wallet);

      const tx = await client.vote_poll({
        id: toContractId(id),
        choice,
      });

      await tx.signAndSend();

      setStatus(`Voted for option ${choice === 1 ? "A" : "B"}`);
      await getPolls();
    } catch (error) {
      console.error(error);
      setStatus(`Failed to vote for option ${choice === 1 ? "A" : "B"}`);
    }
  }

  async function deletePoll(id: Poll["id"]) {
    try {
      if (!wallet) {
        throw new Error("Connect wallet first");
      }

      const client = createContractClient(wallet);

      const tx = await client.delete_poll({
        id: toContractId(id),
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
          </div>
        </section>

        <section className="app-section">
          <div className="section-heading">
            <h2>Create Poll</h2>
            <p>Submit custom poll data to the deployed contract.</p>
          </div>

          <form
            className="poll-form"
            onSubmit={(event) => {
              event.preventDefault();
              void createPoll();
            }}
          >
            <label className="field">
              <span>Question</span>
              <input
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="What should we vote on?"
              />
            </label>

            <div className="form-row">
              <label className="field">
                <span>Option A</span>
                <input
                  value={optionA}
                  onChange={(event) => setOptionA(event.target.value)}
                  placeholder="First option"
                />
              </label>

              <label className="field">
                <span>Option B</span>
                <input
                  value={optionB}
                  onChange={(event) => setOptionB(event.target.value)}
                  placeholder="Second option"
                />
              </label>
            </div>

            <button className="button button-primary" type="submit">
              Create Poll
            </button>
          </form>
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
            <h2>Polls</h2>
            <p>All polls returned by the contract read call.</p>
          </div>

          {!polls ? (
            <div className="empty-state">No polls loaded yet.</div>
          ) : polls.length === 0 ? (
            <div className="empty-state">No polls found.</div>
          ) : (
            <div className="polls-grid">
              {polls.map((poll) => (
                <article className="poll-card" key={poll.id.toString()}>
                  <div className="poll-card-header">
                    <span>Poll ID</span>
                    <code>{poll.id.toString()}</code>
                  </div>

                  <h3>{poll.question}</h3>

                  <div className="poll-options">
                    <div>
                      <span>Option A</span>
                      <strong>{poll.option_a}</strong>
                      <small>{poll.votes_a.toString()} votes</small>
                    </div>
                    <div>
                      <span>Option B</span>
                      <strong>{poll.option_b}</strong>
                      <small>{poll.votes_b.toString()} votes</small>
                    </div>
                  </div>

                  <div className="poll-actions">
                    <button
                      className="button button-success"
                      onClick={() => void votePoll(poll.id, 1)}
                    >
                      Vote option A
                    </button>
                    <button
                      className="button button-success"
                      onClick={() => void votePoll(poll.id, 2)}
                    >
                      Vote option B
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => void deletePoll(poll.id)}
                    >
                      Delete Poll
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <details className="raw-result">
            <summary>Raw response</summary>
            <pre className="result-block">
              <code>{polls ? stringifyPolls(polls) : "No polls loaded yet."}</code>
            </pre>
          </details>
        </section>
      </section>
    </main>
  );
}

export default App;
