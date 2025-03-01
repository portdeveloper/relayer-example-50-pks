"use client";

import type { NextPage } from "next";
import { useBlockNumber } from "wagmi";
import { useState, useEffect } from "react";

const Home: NextPage = () => {
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const [counter, setCounter] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [txCount, setTxCount] = useState(0);

  // Fetch the current counter value
  const fetchCounter = async () => {
    try {
      const response = await fetch("/api/counter");
      const data = await response.json();
      setCounter(data.counter);
    } catch (error) {
      console.error("Error fetching counter:", error);
    }
  };

  useEffect(() => {
    fetchCounter();
    // Refresh counter every 2 seconds
    const interval = setInterval(fetchCounter, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleIncrement = async () => {
    try {
      setIsLoading(true);
      await fetch("/api/relayer/increment", {
        method: "POST",
      });
      setTxCount(prev => prev + 1);
      // The counter will update via the interval
    } catch (error) {
      console.error("Error incrementing:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10 w-full">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Berry Fast Relayer</h2>
            <p>This demo showcases a high-throughput relayer system on Monad.</p>
            
            <div className="stats shadow mt-4">
              <div className="stat">
                <div className="stat-title">Current Block</div>
                <div className="stat-value text-primary">{blockNumber?.toString() || "Loading..."}</div>
              </div>
              
              <div className="stat">
                <div className="stat-title">Counter Value</div>
                <div className="stat-value">{counter !== null ? counter : "Loading..."}</div>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold">How the Relayer Works:</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>The relayer uses multiple private keys to send transactions in parallel</li>
                <li>When you click "Increment", the request is queued on the server</li>
                <li>Available private keys are assigned to process transactions from the queue</li>
                <li>Each transaction calls the <code>increment()</code> function on the YourContract</li>
                <li>This architecture allows for high throughput without transaction conflicts</li>
              </ul>
              
              <div className="stats shadow">
                <div className="stat">
                  <div className="stat-title">Your Transactions</div>
                  <div className="stat-value">{txCount}</div>
                  <div className="stat-desc">Transactions you've sent this session</div>
                </div>
              </div>
            </div>
            
            <div className="card-actions justify-center mt-4">
              <button 
                className={`btn btn-primary ${isLoading ? "loading" : ""}`} 
                onClick={handleIncrement}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Increment Counter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
