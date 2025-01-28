"use client";

import { useBlockNumber } from "wagmi";

export const TransactionVisualizer = () => {
  const { data: blockNumber } = useBlockNumber({ watch: true });

  return (
    <div className="bg-base-100 shadow-lg rounded-lg p-4 mt-4">
      <h2 className="text-xl font-bold mb-4">Current Block Number</h2>
      <div className="text-4xl font-mono text-center">{blockNumber?.toString()}</div>
    </div>
  );
};
