import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../lib/db";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Query the latest statistics row (assuming the most recent update is the latest row)
    const stats = await query(`
      SELECT average_response_latency, total_proposers, upcoming_slots, last_updated
      FROM public.statistics 
      ORDER BY last_updated DESC
      LIMIT 1
    `);

    if (!stats.length) {
      return res.status(404).json({ error: "No statistics available" });
    }

    res.status(200).json(stats[0]);
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
