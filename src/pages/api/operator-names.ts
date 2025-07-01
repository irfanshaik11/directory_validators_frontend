import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

// Configure body size limit
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { addresses } = req.body;

    if (!addresses || !Array.isArray(addresses)) {
      return res.status(400).json({ message: 'Addresses array is required' });
    }

    // Debug: print received addresses count
    console.log('Received addresses count:', addresses.length);
    console.log('First few addresses:', addresses.slice(0, 5));

    // PostgreSQL query: use the correct table name 'validators'
    const pgQuery = `
      SELECT address, operator_name 
      FROM validators 
      WHERE address = ANY($1::text[])
    `;

    const result = await query(pgQuery, [addresses]);
    
    // Debug: print SQL result count
    console.log('SQL result count:', result.length);
    console.log('First few results:', result.slice(0, 3));

    // Create a map of address to operator_name (case-insensitive, trimmed)
    const operatorMap: { [key: string]: string } = {};
    result.forEach((row: any) => {
      if (row.address) {
        operatorMap[row.address.trim().toLowerCase()] = row.operator_name || 'N/A';
      }
    });

    // Debug: print operatorMap count
    console.log('Operator map count:', Object.keys(operatorMap).length);

    // Return names for each input address (case-insensitive, trimmed)
    const responseMap: { [key: string]: string } = {};
    addresses.forEach((addr: string) => {
      const key = addr.trim().toLowerCase();
      responseMap[addr] = operatorMap[key] || 'N/A';
    });

    res.status(200).json(responseMap);
  } catch (error) {
    console.error('Error fetching operator names:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 