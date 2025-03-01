import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "~~/scaffold.config";
import { CONTRACT_ABI } from "~~/utils/scaffold-eth/abi";


// Create transport and client
const transport = http(process.env.NEXT_PUBLIC_MONAD_RPC_URL);
const publicClient = createPublicClient({
  chain: monadTestnet,
  transport,
});

// Contract details
const CONTRACT_ADDRESS = "0x952f40B7bEB98A45D3f3d4f9918F60d054e247C2";

export async function GET() {
  try {
    // Read the counter value from the contract
    const counter = await publicClient.readContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: "counter",
    });

    return NextResponse.json({ counter: Number(counter) });
  } catch (error) {
    console.error("Error fetching counter:", error);
    return NextResponse.json({ error: "Failed to fetch counter" }, { status: 500 });
  }
} 