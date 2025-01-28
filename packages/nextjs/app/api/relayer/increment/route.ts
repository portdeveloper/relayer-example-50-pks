import { NextResponse } from "next/server";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadDevnet } from "~~/scaffold.config";

// Create transport
const transport = http(process.env.NEXT_PUBLIC_MONAD_RPC_URL);

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

async function getAvailableKey(): Promise<string | undefined> {
  return PRIVATE_KEYS.find(key => !busyKeys.has(key));
}

async function processQueue() {
  if (txQueue.length === 0) return;

  const privateKey = await getAvailableKey();
  if (!privateKey) return; // All keys are busy

  busyKeys.add(privateKey);
  const tx = txQueue.shift();

  if (tx) {
    try {
      await tx.execute(privateKey);
      // Wait 1 second before marking key as available
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Error processing tx:", error);
    } finally {
      busyKeys.delete(privateKey);
      // Try to process more transactions if any are in queue
      processQueue();
    }
  } else {
    busyKeys.delete(privateKey);
  }
}

export async function POST() {
  try {
    if (PRIVATE_KEYS.length === 0) {
      return NextResponse.json({ error: "No private keys configured" }, { status: 500 });
    }

    // Add transaction to queue
    txQueue.push({
      execute: async (privateKey: string) => {
        // Create wallet just before sending transaction
        const account = privateKeyToAccount(`0x${privateKey}`);
        const wallet = createWalletClient({
          account,
          chain: monadDevnet,
          transport,
        });

        await wallet.writeContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "increment",
          chain: monadDevnet,
        });
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
