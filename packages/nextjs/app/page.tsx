"use client";

import type { NextPage } from "next";
import { TransactionVisualizer } from "~~/components/monad/TransactionVisualizer";

const Home: NextPage = () => {
  const handleIncrement = () => {
    fetch("/api/relayer/increment", {
      method: "POST",
    });
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

          <TransactionVisualizer />
        </div>
      </div>
    </>
  );
};

export default Home;
