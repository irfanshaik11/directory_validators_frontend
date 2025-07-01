import type { NextApiRequest, NextApiResponse } from "next";

type ValidatorResponse = {
  validators: string[];
};




export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ValidatorResponse | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const response = await fetch("https://hoodi-rpc.interstate.so/api/v1/validators/active", {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching validators:", error);
    return res.status(500).json({ error: "Failed to fetch validators" });
  }
} 