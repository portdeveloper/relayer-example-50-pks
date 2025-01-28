import { NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { monadDevnet } from "~~/scaffold.config";

// Create a wallet client for signing transactions
const transport = http(process.env.NEXT_PUBLIC_MONAD_RPC_URL);
const publicClient = createPublicClient({
  chain: monadDevnet,
  transport,
});

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

export async function POST() {
  try {
    if (!process.env.RELAYER_PRIVATE_KEY) {
      return NextResponse.json({ error: "Private key not configured" }, { status: 500 });
    }

    // Create account from private key
    const account = privateKeyToAccount(`0x${process.env.RELAYER_PRIVATE_KEY}`);

    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: monadDevnet,
      transport,
    });

    // Send transaction
    await walletClient.writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "increment",
    });
  } catch (error) {
    console.error("Error in increment route:", error);
    return NextResponse.json({ error: "Failed to increment" }, { status: 500 });
  }
}
