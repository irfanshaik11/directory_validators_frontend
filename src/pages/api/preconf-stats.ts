import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get total preconf transactions from the last 24 hours (PostgreSQL syntax)
    const result = await query(
      `SELECT COUNT(*) as total_preconfs
      FROM transaction_hashes
       WHERE timestamp >= NOW() - INTERVAL '24 HOURS'`
    );

    // Calculate total preconf txs in 24 hours (total preconfs / 7200)
    const totalPreconfs = result[0]?.total_preconfs || 0;
    const totalPreconfTxsIn24Hours = totalPreconfs / 7200;

    res.status(200).json({
      totalPreconfs,
      totalPreconfTxsIn24Hours
    });
  } catch (error) {
    console.error("Error fetching preconf stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch preconf stats",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 