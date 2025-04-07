"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useBlockNumber } from "wagmi";
import { RelayerSchema } from "~~/components/RelayerSchema";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [txCount, setTxCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<{
    message?: string;
    queueLength?: number;
    availableKeys?: number;
  } | null>(null);

  const { data: counter } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "counter",
  });

  const handleIncrement = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/relayer/increment", {
        method: "POST",
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.details || "Failed to increment");
      }
      
      setLastResponse(data);
      setTxCount(prev => prev + 20); // Always increment by 20
    } catch (error) {
      console.error("Error incrementing:", error);
      setError(error instanceof Error ? error.message : "Failed to increment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 w-full px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-7xl">
          {/* Left Column - Counter and Controls */}
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <h2 className="card-title">Simple Relayer with 50 private keys</h2>

              <div className="stats shadow mt-4">
                <div className="stat w-[200px]">
                  <div className="stat-title">Current Block</div>
                  <div className="stat-value text-primary">{blockNumber?.toString() || "Loading..."}</div>
                </div>

                <div className="stat">
                  <div className="stat-title">Counter Value</div>
                  <div className="stat-value">{counter?.toString()}</div>
                </div>
              </div>

              <div className="divider"></div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold">How It Works:</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>The relayer uses multiple private keys to send transactions in parallel</li>
                  <li>
                    When you click &quot;Increment&quot;, the request is queued on the server, which is a simple nextjs api route
                  </li>
                  <li>Available private keys are assigned to process transactions from the queue</li>
                  <li>
                    Each transaction calls the <code>increment()</code> function on the YourContract
                  </li>
                  <li>This architecture allows for high throughput without transaction conflicts</li>
                </ul>

                <div className="stats shadow">
                  <div className="stat">
                    <div className="stat-title">Your Transactions</div>
                    <div className="stat-value">{txCount}</div>
                    <div className="stat-desc">Transactions you&apos;ve sent this session</div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-error">
                    <div>
                      <h3 className="font-bold">Error:</h3>
                      <div className="text-sm">{error}</div>
                    </div>
                  </div>
                )}

                {lastResponse && (
                  <div className="alert alert-info">
                    <div>
                      <h3 className="font-bold">Last Response:</h3>
                      <div className="text-sm">
                        <p>{lastResponse.message}</p>
                        <p>Queue Length: {lastResponse.queueLength}</p>
                        <p>Available Keys: {lastResponse.availableKeys}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="card-actions justify-center mt-6">
                <button 
                  className={`btn btn-primary btn-lg ${isLoading ? 'loading' : ''}`} 
                  onClick={handleIncrement}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Send 20 Increments'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Relayer Schema */}
          <div className="card bg-base-100 shadow-xl h-full">
            <div className="card-body">
              <RelayerSchema />
            </div>
          </div>
        </div>
        <div className="gap-6 w-full max-w-7xl">
          {/* How to Use This Repo section */}
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">How to Use This Repo</h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Getting Started</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>
                      Clone the repository:{" "}
                      <code className="bg-base-300 p-1 rounded">
                        git clone https://github.com/portdeveloper/relayer-example-se2.git
                      </code>
                    </li>
                    <li>
                      Install dependencies: <code className="bg-base-300 p-1 rounded">yarn install</code>
                    </li>
                    <li>
                      cd packages/foundry: <code className="bg-base-300 p-1 rounded">cd packages/foundry</code>
                    </li>
                    <li>
                      Install foundry dependencies: <code className="bg-base-300 p-1 rounded">forge install</code>
                    </li>
                    <li>Open a new terminal</li>
                    <li>
                      Start the development server: <code className="bg-base-300 p-1 rounded">yarn start</code>
                    </li>
                  </ol>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">Project Structure</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      <strong>packages/nextjs</strong>: Frontend application built with Next.js
                    </li>
                    <li>
                      <strong>packages/foundry</strong>: Smart contracts and deployment scripts
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">Using the Relayer</h3>
                  <p className="mb-2">This project demonstrates a high-throughput transaction relayer system:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Configure private keys in <code className="bg-base-300 p-1 rounded">.env</code> file (see{" "}
                      <code className="bg-base-300 p-1 rounded">.env.example</code>)
                    </li>
                    <li>The relayer automatically processes transaction requests from the queue</li>
                    <li>
                      Customize the relayer logic in{" "}
                      <code className="bg-base-300 p-1 rounded">packages/nextjs/api/relayer/increment/route.ts</code>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">Customizing Smart Contracts</h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>
                      Edit contracts in <code className="bg-base-300 p-1 rounded">packages/foundry/contracts</code>
                    </li>
                    <li>
                      Deploy to your local node(anvil) <code className="bg-base-300 p-1 rounded">yarn deploy</code>
                    </li>
                    <li>
                      Deploy to Monad Testnet with{" "}
                      <code className="bg-base-300 p-1 rounded">yarn deploy --network monad_testnet</code>
                    </li>
                    <li>
                      Test with <code className="bg-base-300 p-1 rounded">yarn test</code>
                    </li>
                  </ul>
                </div>

                <div className="alert alert-info">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Need Help?</h3>
                    <div className="text-sm">
                      Check out the{" "}
                      <a href="https://docs.scaffoldeth.io" className="link" target="_blank" rel="noopener noreferrer">
                        Scaffold-ETH 2 Documentation
                      </a>{" "}
                      for Scaffold-ETH 2 related questions or join{" "}
                      <a href="https://discord.gg/monaddev" className="link" target="_blank" rel="noopener noreferrer">
                        Monad Developer Discord for any question related to Monad
                      </a>
                      .
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
