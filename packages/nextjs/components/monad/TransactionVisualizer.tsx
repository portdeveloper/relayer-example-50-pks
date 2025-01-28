"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import ReactConfetti from "react-confetti";
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

// Confetti colors using our theme colors and complementary shades
const CONFETTI_COLORS = [
  "#34EEB6", // success (green)
  "#93BBFB", // primary (blue)
  "#FFCF72", // warning (yellow)
  "#FF8863", // error (orange)
  "#DAE8FF", // secondary (light blue)
  "#4969A6", // accent (dark blue)
  "#F9FBFF", // neutral (white)
  "#385183", // info (navy)
  "#2A3655", // base-200 (dark)
  "#E879F9", // pink
  "#22D3EE", // cyan
  "#A78BFA", // violet
];

type Props = {
  confettiIds: number[];
};

export const TransactionVisualizer = ({ confettiIds }: Props) => {
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [lastBlockTime, setLastBlockTime] = useState<Date>();
  const [lastBlock, setLastBlock] = useState<Block>();
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

  return (
    <div className="flex flex-col gap-2 md:gap-4">
      {/* Multiple confetti instances */}
      {confettiIds.map(id => (
        <ReactConfetti
          key={id}
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          initialVelocityY={20}
          colors={CONFETTI_COLORS}
          style={{ position: "fixed", top: 0, left: 0, zIndex: 50 }}
        />
      ))}

      <div className="bg-base-100 shadow-lg rounded-lg p-2 md:p-4 mt-2 md:mt-4">
        <div className="grid grid-cols-3 gap-1 md:gap-4 text-sm md:text-base">
          <div className="stat py-2 md:py-4">
            <div className="stat-title text-xs md:text-base">Current Block</div>
            <div className="stat-value text-xl md:text-3xl font-mono">{blockNumber?.toString() || "Loading..."}</div>
            <div className="stat-desc text-xs truncate">
              {lastBlockTime && `Last block ${formatDistanceToNow(lastBlockTime, { addSuffix: true })}`}
            </div>
          </div>

          <div className="stat py-2 md:py-4">
            <div className="stat-title text-xs md:text-base">Block Transactions</div>
            <div className="stat-value text-xl md:text-3xl">{blockTransactions}</div>
            <div className="stat-desc text-xs">Transactions in block</div>
          </div>

          <div className="stat py-2 md:py-4">
            <div className="stat-title text-xs md:text-base">Chain Speed</div>
            <div className="stat-value text-xl md:text-3xl">1s</div>
            <div className="stat-desc text-xs">Block time</div>
          </div>
        </div>
      </div>

      {/* Static Transaction Visualization */}
      <div className="bg-base-100 shadow-lg rounded-lg p-2 md:p-4">
        <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-4">Live Transactions</h3>
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
