import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function GET() {
  try {
    // Get all tables
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    const tables = await query(tablesQuery);
    
    let schemaInfo: any = {};
    
    // For each table, get column information
    for (const table of tables.rows) {
      const tableName = table.table_name;
      
      const columnsQuery = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `;
      
      const columns = await query(columnsQuery, [tableName]);
      
      // Get sample data count
      const countQuery = `SELECT COUNT(*) as count FROM "${tableName}"`;
      const count = await query(countQuery);
      
      schemaInfo[tableName] = {
        columns: columns.rows,
        rowCount: parseInt(count.rows[0].count)
      };
    }
    
    return NextResponse.json(schemaInfo);
    
  } catch (error) {
    console.error('Error exploring schema:', error);
    return NextResponse.json(
      { error: 'Failed to explore database schema', details: error },
      { status: 500 }
    );
  }
}