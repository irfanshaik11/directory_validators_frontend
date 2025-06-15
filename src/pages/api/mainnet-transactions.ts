import type { NextApiRequest, NextApiResponse } from "next";

type Transaction = {
  tx_hash: string;
  slot: number;
  timestamp: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Try fetching from hoodi-rpc (assuming Solana-like chain)
    const response = await fetch("https://hoodi-rpc.interstate.so/api/v1/transactions", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`Failed to fetch transactions: ${response.statusText}`);

    const data = await response.json();
    // Transform data to match Transaction interface
    const transactions: Transaction[] = data.map((tx: any) => ({
      tx_hash: tx.signature || tx.hash || tx.id,
      slot: tx.slot || tx.blockNumber || 0,
      timestamp: tx.timestamp || new Date().toISOString(),
    }));

    res.status(200).json(transactions.slice(0, 100)); // Limit to 100 for performance
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Server error" });
  }
}