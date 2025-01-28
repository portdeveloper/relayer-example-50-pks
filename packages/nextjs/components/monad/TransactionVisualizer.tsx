"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Block, Hash, formatEther } from "viem";
import { useBlockNumber, usePublicClient } from "wagmi";

type TransactionWithVisuals = {
  hash: Hash;
  value: bigint;
  position: {
    x: number;
    y: number;
  };
  timestamp: number;
  color: string;
};

// Simple color scheme
const VALUE_COLOR = "bg-success";
const CONTRACT_COLOR = "bg-primary";

export const TransactionVisualizer = () => {
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [lastBlockTime, setLastBlockTime] = useState<Date>();
  const [lastBlock, setLastBlock] = useState<Block>();
  const [previousBlockTimestamp, setPreviousBlockTimestamp] = useState<bigint>();
  const [transactions, setTransactions] = useState<TransactionWithVisuals[]>([]);
  const publicClient = usePublicClient();

  // Function to generate random position
  const generateTransactionVisuals = (value: bigint) => ({
    position: {
      x: Math.floor(Math.random() * 100),
      y: Math.floor(Math.random() * 100),
    },
    color: Number(value) > 0 ? VALUE_COLOR : CONTRACT_COLOR,
  });

  useEffect(() => {
    const fetchBlock = async () => {
      if (!blockNumber || !publicClient) return;

      try {
        const block = await publicClient.getBlock({ blockNumber });
        setLastBlockTime(new Date(Number(block.timestamp) * 1000));

        // Get previous block timestamp
        if (blockNumber > 0n) {
          const prevBlock = await publicClient.getBlock({
            blockNumber: blockNumber - 1n,
          });
          setPreviousBlockTimestamp(prevBlock.timestamp);
        }

        setLastBlock(block);

        // Process new transactions
        const newTxs = block.transactions.map(hash => ({
          hash,
          value: 0n,
          ...generateTransactionVisuals(0n),
          timestamp: Date.now(),
        }));

        // Fetch transaction details
        const txDetails = await Promise.all(newTxs.map(tx => publicClient.getTransaction({ hash: tx.hash })));

        // Update transactions with values
        const txsWithValues = newTxs.map((tx, i) => {
          const value = txDetails[i]?.value ?? 0n;
          return {
            ...tx,
            value,
            ...generateTransactionVisuals(value),
          };
        });

        setTransactions(prev => [...txsWithValues, ...prev].slice(0, 50));
      } catch (error) {
        console.error("Error fetching block:", error);
      }
    };

    fetchBlock();

    // Cleanup old transactions
    const cleanup = setInterval(() => {
      const now = Date.now();
      setTransactions(prev => prev.filter(tx => now - tx.timestamp < 5000));
    }, 1000);

    return () => clearInterval(cleanup);
  }, [blockNumber, publicClient]);

  const blockTransactions = lastBlock?.transactions.length ?? 0;

  // Calculate block time from block timestamps
  const blockTime = lastBlock && previousBlockTimestamp ? Number(lastBlock.timestamp - previousBlockTimestamp) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-100 shadow-lg rounded-lg p-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="stat">
            <div className="stat-title">Current Block</div>
            <div className="stat-value font-mono">{blockNumber?.toString() || "Loading..."}</div>
            <div className="stat-desc">
              {lastBlockTime && `Last block ${formatDistanceToNow(lastBlockTime, { addSuffix: true })}`}
            </div>
          </div>

          <div className="stat">
            <div className="stat-title">Block Transactions</div>
            <div className="stat-value">{blockTransactions}</div>
            <div className="stat-desc">Transactions in current block</div>
          </div>

          <div className="stat">
            <div className="stat-title">Chain Speed</div>
            <div className="stat-value">{blockTime !== null ? <span>{blockTime}s</span> : "Calculating..."}</div>
            <div className="stat-desc">Block time</div>
          </div>
        </div>
      </div>

      {/* Static Transaction Visualization */}
      <div className="bg-base-100 shadow-lg rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Live Transactions</h3>
        <div className="relative h-80 w-full bg-base-200 rounded-lg overflow-hidden">
          {transactions.map(tx => {
            const value = Number(formatEther(tx.value));
            return (
              <div
                key={tx.hash}
                className={`
                  absolute w-3 h-3 rounded-full transform -translate-x-1/2 -translate-y-1/2
                  ${tx.color}
                `}
                style={{
                  left: `${tx.position.x}%`,
                  top: `${tx.position.y}%`,
                }}
              >
                {value > 0 && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs">{value.toFixed(2)}</div>
                )}
              </div>
            );
          })}

          {/* Static grid */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 pointer-events-none opacity-5">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-base-300" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
