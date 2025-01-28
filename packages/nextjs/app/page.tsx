"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { TransactionVisualizer } from "~~/components/monad/TransactionVisualizer";

const Home: NextPage = () => {
  const [lastTxHash, setLastTxHash] = useState<string>();

  const handleIncrement = async () => {
    try {
      const response = await fetch("/api/relayer/increment", {
        method: "POST",
      });
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setLastTxHash(data.hash);
    } catch (error) {
      console.error("Failed to increment:", error);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <div className="flex flex-col items-center mt-8 gap-2">
            <button className="btn btn-primary" onClick={handleIncrement}>
              Increment Counter
            </button>
            {lastTxHash && (
              <div className="text-sm opacity-70">
                Last tx: {lastTxHash.slice(0, 6)}...{lastTxHash.slice(-4)}
              </div>
            )}
          </div>

          <div className="mt-8 w-full max-w-[1200px] mx-auto">
            <TransactionVisualizer />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
