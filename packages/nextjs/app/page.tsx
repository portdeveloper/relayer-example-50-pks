"use client";

import type { NextPage } from "next";
import { useEffect, useState } from "react";
import { useBlockNumber } from "wagmi";
import { TransactionVisualizer } from "~~/components/monad/TransactionVisualizer";

type ConfettiInstance = {
  id: number;
  createdAt: number;
};

const Home: NextPage = () => {
  const { data: blockNumber } = useBlockNumber();
  const [confettiInstances, setConfettiInstances] = useState<ConfettiInstance[]>([]);
  const [nextId, setNextId] = useState(0);

  // Cleanup old confetti instances
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setConfettiInstances(prev => 
        prev.filter(instance => now - instance.createdAt < 3000)
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleIncrement = async () => {
    try {
      // Add a new confetti instance
      const newInstance = {
        id: nextId,
        createdAt: Date.now(),
      };
      setConfettiInstances(prev => [...prev, newInstance]);
      setNextId(id => id + 1);

      await fetch("/api/relayer/increment", {
        method: "POST",
      });
    } catch (error) {
      console.error("Error incrementing:", error);
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
          </div>

          <div className="mt-8 w-full max-w-[1200px] mx-auto">
            <TransactionVisualizer confettiIds={confettiInstances.map(instance => instance.id)} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
