import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadDevnet } from "~~/scaffold.config";

// Create transport and clients
const transport = http(process.env.NEXT_PUBLIC_MONAD_RPC_URL);
const publicClient = createPublicClient({
  chain: monadDevnet,
  transport,
});

// Initialize private keys
const PRIVATE_KEYS = [
  process.env.RELAYER_PRIVATE_KEY,
  process.env.RELAYER_PRIVATE_KEY_2,
  process.env.RELAYER_PRIVATE_KEY_3,
].filter((key): key is string => !!key);

// Contract details
const CONTRACT_ADDRESS = "0x927d45Fb81B1B14dC4E8DE8f62930D5C33a43D22";
const CONTRACT_ABI = [
  {
    inputs: [],
    name: "increment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Queue and wallet tracking
type QueuedTx = {
  execute: (privateKey: string) => Promise<void>;
};
const txQueue: QueuedTx[] = [];
const busyKeys = new Set<string>();
let isCheckingQueue = false;

async function getAvailableKey(): Promise<string | undefined> {
  const key = PRIVATE_KEYS.find(key => !busyKeys.has(key));
  console.log("Available keys:", PRIVATE_KEYS.filter(key => !busyKeys.has(key)).length);
  return key;
}

async function processSingleTransaction(privateKey: string, tx: QueuedTx) {
  const startTime = Date.now();
  try {
    // Execute transaction and get the hash
    const account = privateKeyToAccount(`0x${privateKey}`);
    const wallet = createWalletClient({
      account,
      chain: monadDevnet,
      transport,
    });

    const hash = await wallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "increment",
      chain: monadDevnet,
    });

    console.log("Transaction sent:", hash, "waiting for confirmation...");

    // Wait for transaction to be confirmed
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    console.log("Transaction confirmed in block:", receipt.blockNumber);
  } catch (error) {
    console.error("Error processing tx:", error);
  } finally {
    busyKeys.delete(privateKey);
    console.log("Freed key:", privateKey.slice(-4), "Time taken:", Date.now() - startTime, "ms");
  }
}

async function processQueue() {
  if (isCheckingQueue) return;
  isCheckingQueue = true;

  while (txQueue.length > 0) {
    const privateKey = await getAvailableKey();
    if (!privateKey) {
      // If no keys available, wait 100ms and check again
      await new Promise(resolve => setTimeout(resolve, 100));
      continue;
    }

    console.log("Using key:", privateKey.slice(-4), "Queue length:", txQueue.length);
    busyKeys.add(privateKey);
    const tx = txQueue.shift();
    if (tx) {
      // Process transaction without waiting for it
      processSingleTransaction(privateKey, tx);
    } else {
      busyKeys.delete(privateKey);
    }
  }

  isCheckingQueue = false;
}

export async function POST() {
  try {
    if (PRIVATE_KEYS.length === 0) {
      return NextResponse.json({ error: "No private keys configured" }, { status: 500 });
    }

    // Add transaction to queue
    txQueue.push({
      execute: async () => {
        // Empty execute function since we moved the logic to processSingleTransaction
      },
    });

    // Try to process queue
    processQueue();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in increment route:", error);
    return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
  }
}
