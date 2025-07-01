import { NextApiRequest, NextApiResponse } from 'next';
import { query } from '../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Check what tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const tables = await query(tablesQuery);
    console.log('Available tables:', tables);
    
    // Check validators table structure
    const validatorsStructureQuery = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'validators' 
      ORDER BY ordinal_position
    `;
    
    const validatorsStructure = await query(validatorsStructureQuery);
    console.log('Validators table structure:', validatorsStructure);
    
    // Get a sample row from validators table
    const sampleQuery = `SELECT * FROM validators LIMIT 3`;
    const sample = await query(sampleQuery);
    console.log('Sample from validators:', sample);
    
    res.status(200).json({
      tables: tables.map(t => t.table_name),
      validatorsStructure: validatorsStructure,
      sample: sample,
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database check error:', error);
    res.status(500).json({ 
      error: (error as Error).message,
      stack: (error as Error).stack
    });
  }
} 