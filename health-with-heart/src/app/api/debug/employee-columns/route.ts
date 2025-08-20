import { NextResponse } from 'next/server';
import { query } from '../../../../lib/database';

export async function GET() {
  try {
    // Get all columns from employee table
    const columnsQuery = `
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'employee'
      ORDER BY ordinal_position
    `;

    const result = await query(columnsQuery);
    
    return NextResponse.json({
      table: 'employee',
      columns: result.rows
    });

  } catch (error) {
    console.error('Error fetching employee columns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee table schema' },
      { status: 500 }
    );
  }
}