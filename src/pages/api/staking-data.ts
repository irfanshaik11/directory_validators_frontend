// pages/api/validators.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { query } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Query the validators table with the relevant columns
    const data = await query(
      `SELECT id, validator_name, commission, delegated_shares, apr
       FROM public.validators
       ORDER BY id ASC`
    );
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching validator data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
