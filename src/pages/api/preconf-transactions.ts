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
    // Fetch data with correct column names from PostgreSQL
    const result = await query(
      `SELECT tx_hash, slot, timestamp
      FROM transaction_hashes
      ORDER BY timestamp DESC
       LIMIT 1000`
    );

    // Calculate total preconf transactions in the past 24 hours
    const totalPreconfsResult = await query(
      `SELECT COUNT(*) as total_preconfs
       FROM transaction_hashes
       WHERE timestamp >= NOW() - INTERVAL '24 HOURS'`
    );
    const totalPreconfs = totalPreconfsResult[0]?.total_preconfs || 0;
    console.log("CHECKING TOTAL PRECONFS")
    console.log("totalPreconfsResult",totalPreconfsResult);
    console.log("totalPreconfs",totalPreconfs);
    const totalPreconfTxsIn24Hours = totalPreconfs / 7200;

    res.status(200).json({
      transactions: result,
      totalPreconfTxsIn24Hours,
      label: "Eth blocks supporting interstate preconfs last 24 hrs",
      debug: { totalPreconfsResult, totalPreconfs }
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ 
      error: "Failed to fetch transactions",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 