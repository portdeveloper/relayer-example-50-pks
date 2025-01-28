"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Block, Hash, Transaction, formatEther } from "viem";
import { useBlockNumber, usePublicClient } from "wagmi";

type TransactionWithVisuals = {
  hash: Hash;
  value: bigint;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
};

export const TransactionVisualizer = () => {
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [lastBlockTime, setLastBlockTime] = useState<Date>();
  const [recentBlocks, setRecentBlocks] = useState<Block[]>([]);
  const [showPulse, setShowPulse] = useState(false);
  const [transactions, setTransactions] = useState<TransactionWithVisuals[]>([]);
  const publicClient = usePublicClient();

  // Function to generate random position
  const generateRandomPosition = () => ({
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
  });

  useEffect(() => {
    const fetchRecentBlocks = async () => {
      if (!blockNumber || !publicClient) return;

      try {
        const block = await publicClient.getBlock({ blockNumber });
        setLastBlockTime(new Date(Number(block.timestamp) * 1000));
        setShowPulse(true);
        setTimeout(() => setShowPulse(false), 1000);

        // Get last 5 blocks
        const blocks = await Promise.all(
          Array.from({ length: 5 }, (_, i) =>
            publicClient.getBlock({
              blockNumber: blockNumber - BigInt(i),
              includeTransactions: true,
            }),
          ),
        );
        setRecentBlocks(blocks);

        // Process new transactions
        const newTxs = block.transactions.map(hash => ({
          hash,
          value: 0n, // We'll need an additional RPC call to get the value
          position: generateRandomPosition(),
          timestamp: Date.now(),
        }));

        // Fetch transaction details
        const txDetails = await Promise.all(newTxs.map(tx => publicClient.getTransaction({ hash: tx.hash })));

        // Update transactions with values
        const txsWithValues = newTxs.map((tx, i) => ({
          ...tx,
          value: txDetails[i]?.value ?? 0n,
        }));

        setTransactions(prev => [...txsWithValues, ...prev].slice(0, 50)); // Keep last 50 transactions
      } catch (error) {
        console.error("Error fetching blocks:", error);
      }
    };

    fetchRecentBlocks();

    // Cleanup old transactions
    const cleanup = setInterval(() => {
      const now = Date.now();
      setTransactions(prev => prev.filter(tx => now - tx.timestamp < 5000)); // Remove transactions older than 5 seconds
    }, 1000);

    return () => clearInterval(cleanup);
  }, [blockNumber, publicClient]);

  const totalRecentTransactions = recentBlocks.reduce((sum, block) => sum + block.transactions.length, 0);

  const averageTransactionsPerBlock =
    recentBlocks.length > 0 ? Math.round(totalRecentTransactions / recentBlocks.length) : 0;

  const blockTime =
    recentBlocks.length >= 2
      ? Math.round(
          (Number(recentBlocks[0].timestamp) - Number(recentBlocks[recentBlocks.length - 1].timestamp)) /
            (recentBlocks.length - 1),
        )
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-100 shadow-lg rounded-lg p-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat relative overflow-hidden">
            {/* Animated pulse effect for new blocks */}
            {showPulse && <div className="absolute inset-0 animate-ping-slow bg-primary/20 rounded-lg" />}
            <div className="stat-title flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              Current Block
            </div>
            <div className="stat-value flex items-center gap-2">
              <span className="font-mono">{blockNumber?.toString() || "Loading..."}</span>
            </div>
            <div className="stat-desc flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-base-content/70"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              {lastBlockTime && `Last block ${formatDistanceToNow(lastBlockTime, { addSuffix: true })}`}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-secondary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13 7h-2v2h2V7zm0 4h-2v2h2v-2zm2-8H5a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2zm0 16H5V5h10v14z" />
              </svg>
              Recent Transactions
            </div>
            <div className="stat-value flex items-center gap-2">
              <div className="flex items-center">
                <span>{totalRecentTransactions}</span>
                {/* Animated dots for transaction activity */}
                <span className="flex ml-2">
                  <span className="animate-bounce-delay-1 h-2 w-2 bg-secondary rounded-full mx-0.5" />
                  <span className="animate-bounce-delay-2 h-2 w-2 bg-secondary rounded-full mx-0.5" />
                  <span className="animate-bounce-delay-3 h-2 w-2 bg-secondary rounded-full mx-0.5" />
                </span>
              </div>
            </div>
            <div className="stat-desc">Avg {averageTransactionsPerBlock} tx/block (last 5 blocks)</div>
          </div>

          <div className="stat">
            <div className="stat-title flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-accent"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              Chain Speed
            </div>
            <div className="stat-value flex items-center gap-2">
              {blockTime !== null ? (
                <div className="flex items-center">
                  <span>{blockTime}s</span>
                  {/* Speed indicator */}
                  <div className={`ml-2 flex ${blockTime < 2 ? "animate-pulse" : ""}`}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-6 w-6 ${
                        blockTime < 2 ? "text-success" : blockTime < 5 ? "text-warning" : "text-error"
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              ) : (
                "Calculating..."
              )}
            </div>
            <div className="stat-desc">Average block time</div>
          </div>
        </div>
      </div>

      {/* Transaction Dot Visualization */}
      <div className="bg-base-100 shadow-lg rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Live Transactions</h3>
        <div className="relative h-80 w-full bg-base-200 rounded-lg overflow-hidden">
          {transactions.map(tx => {
            const value = Number(formatEther(tx.value));
            const age = Date.now() - tx.timestamp;
            const opacity = Math.max(0, 1 - age / 5000); // Fade out over 5 seconds

            return (
              <div
                key={tx.hash}
                className={`absolute w-4 h-4 rounded-full bg-purple-500 transform -translate-x-1/2 -translate-y-1/2
                  ${value > 0 ? "animate-transaction-appear-value" : "animate-transaction-appear"}
                  flex items-center justify-center
                `}
                style={{
                  left: `${tx.position.x}%`,
                  top: `${tx.position.y}%`,
                  opacity,
                }}
              >
                <div
                  className={`
                  absolute inset-0 rounded-full 
                  ${value > 0 ? "bg-success" : "bg-primary"}
                  animate-ping-custom
                `}
                />
                <div
                  className={`
                  relative rounded-full w-2 h-2
                  ${value > 0 ? "bg-success" : "bg-primary"}
                `}
                />
              </div>
            );
          })}

          {/* Grid overlay */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 pointer-events-none opacity-10">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-base-300" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
