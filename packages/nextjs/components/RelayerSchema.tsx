// RelayerSchema component to visualize the relayer flow
export const RelayerSchema = () => {
    return (
      <div className="w-full py-4 bg-base-200 rounded-xl p-6 h-full">
        <h3 className="text-center font-bold mb-6">Behind the Scenes: How the Relayer Works</h3>
        
        <div className="flex flex-col space-y-4">
          {/* Step 1: User clicks button */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
              <span className="text-white font-bold">1</span>
            </div>
            <div className="flex-1 bg-base-100 p-3 rounded-lg shadow">
              <p className="font-semibold">User clicks "Increment"</p>
              <p className="text-sm opacity-75">Frontend sends a POST request to /api/relayer/increment</p>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>
          
          {/* Step 2: Server queues transaction */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-4">
              <span className="text-white font-bold">2</span>
            </div>
            <div className="flex-1 bg-base-100 p-3 rounded-lg shadow">
              <p className="font-semibold">Server queues the transaction</p>
              <div className="flex mt-2 space-x-2">
                <div className="bg-secondary/20 p-1 rounded text-xs">Tx 1</div>
                <div className="bg-secondary/20 p-1 rounded text-xs">Tx 2</div>
                <div className="bg-secondary/20 p-1 rounded text-xs">Tx 3</div>
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>
          
          {/* Step 3: Multiple wallets process transactions */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mr-4">
              <span className="text-white font-bold">3</span>
            </div>
            <div className="flex-1 bg-base-100 p-3 rounded-lg shadow">
              <p className="font-semibold">Multiple wallets process transactions in parallel</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                <div className="bg-accent/20 p-1 rounded text-xs flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  Wallet 1: Active
                </div>
                <div className="bg-accent/20 p-1 rounded text-xs flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  Wallet 2: Active
                </div>
                <div className="bg-accent/20 p-1 rounded text-xs flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  Wallet 3: Active
                </div>
                <div className="bg-accent/20 p-1 rounded text-xs flex items-center">
                  <span className="w-3 h-3 bg-gray-500 rounded-full mr-1"></span>
                  Wallet 4: Idle
                </div>
              </div>
            </div>
          </div>
          
          {/* Arrow */}
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>
          
          {/* Step 4: Transactions sent to blockchain */}
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center mr-4">
              <span className="text-white font-bold">4</span>
            </div>
            <div className="flex-1 bg-base-100 p-3 rounded-lg shadow">
              <p className="font-semibold">Transactions sent to Monad blockchain</p>
              <div className="mt-2 text-xs">
                <code className="bg-success/10 p-1 rounded block">
                  YourContract.increment() // Increases counter by 1
                </code>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-base-100 p-3 rounded-lg shadow">
          <p className="text-center text-sm">
            <span className="font-bold">Result:</span> High throughput of transactions without conflicts, 
            allowing the counter to increment rapidly even under heavy load
          </p>
        </div>
      </div>
    );
  };