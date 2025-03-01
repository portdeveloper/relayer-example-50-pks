import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadTestnet } from "~~/scaffold.config";
import { CONTRACT_ABI } from "~~/utils/scaffold-eth/abi";

// Create transport and clients
const transport = http(process.env.NEXT_PUBLIC_MONAD_RPC_URL);
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport,
});

// Initialize private keys
const PRIVATE_KEYS = [
  process.env.RELAYER_PRIVATE_KEY,
  process.env.RELAYER_PRIVATE_KEY_2,
  process.env.RELAYER_PRIVATE_KEY_3,
  process.env.RELAYER_PRIVATE_KEY_4,
  process.env.RELAYER_PRIVATE_KEY_5,
  process.env.RELAYER_PRIVATE_KEY_6,
  process.env.RELAYER_PRIVATE_KEY_7,
  process.env.RELAYER_PRIVATE_KEY_8,
  process.env.RELAYER_PRIVATE_KEY_9,
  process.env.RELAYER_PRIVATE_KEY_10,
  process.env.RELAYER_PRIVATE_KEY_11,
  process.env.RELAYER_PRIVATE_KEY_12,
  process.env.RELAYER_PRIVATE_KEY_13,
  process.env.RELAYER_PRIVATE_KEY_14,
  process.env.RELAYER_PRIVATE_KEY_15,
  process.env.RELAYER_PRIVATE_KEY_16,
  process.env.RELAYER_PRIVATE_KEY_17,
  process.env.RELAYER_PRIVATE_KEY_18,
  process.env.RELAYER_PRIVATE_KEY_19,
  process.env.RELAYER_PRIVATE_KEY_20,
  process.env.RELAYER_PRIVATE_KEY_21,
  process.env.RELAYER_PRIVATE_KEY_22,
  process.env.RELAYER_PRIVATE_KEY_23,
  process.env.RELAYER_PRIVATE_KEY_24,
  process.env.RELAYER_PRIVATE_KEY_25,
  process.env.RELAYER_PRIVATE_KEY_26,
  process.env.RELAYER_PRIVATE_KEY_27,
  process.env.RELAYER_PRIVATE_KEY_28,
  process.env.RELAYER_PRIVATE_KEY_29,
  process.env.RELAYER_PRIVATE_KEY_30,
  process.env.RELAYER_PRIVATE_KEY_31,
  process.env.RELAYER_PRIVATE_KEY_32,
  process.env.RELAYER_PRIVATE_KEY_33,
  process.env.RELAYER_PRIVATE_KEY_34,
  process.env.RELAYER_PRIVATE_KEY_35,
  process.env.RELAYER_PRIVATE_KEY_36,
  process.env.RELAYER_PRIVATE_KEY_37,
  process.env.RELAYER_PRIVATE_KEY_38,
  process.env.RELAYER_PRIVATE_KEY_39,
  process.env.RELAYER_PRIVATE_KEY_40,
  process.env.RELAYER_PRIVATE_KEY_41,
  process.env.RELAYER_PRIVATE_KEY_42,
  process.env.RELAYER_PRIVATE_KEY_43,
  process.env.RELAYER_PRIVATE_KEY_44,
  process.env.RELAYER_PRIVATE_KEY_45,
  process.env.RELAYER_PRIVATE_KEY_46,
  process.env.RELAYER_PRIVATE_KEY_47,
  process.env.RELAYER_PRIVATE_KEY_48,
  process.env.RELAYER_PRIVATE_KEY_49,
  process.env.RELAYER_PRIVATE_KEY_50,
  process.env.RELAYER_PRIVATE_KEY_51,
  process.env.RELAYER_PRIVATE_KEY_52,
  process.env.RELAYER_PRIVATE_KEY_53,
].filter((key): key is string => !!key);

// Contract details
const CONTRACT_ADDRESS = "0x952f40B7bEB98A45D3f3d4f9918F60d054e247C2";


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
      chain: monadTestnet,
      transport,
    });

    const hash = await wallet.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "increment",
      chain: monadTestnet,
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
