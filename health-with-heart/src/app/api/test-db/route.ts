import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Test basic connection
    const testResult = await query('SELECT NOW() as current_time');
    
    // Check if users table exists
    const tableCheckResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'users'
    `);
    
    // List all tables in public schema
    const allTablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return NextResponse.json({
      connection: 'success',
      currentTime: (testResult.rows[0] as { current_time: string }).current_time,
      usersTableExists: tableCheckResult.rows.length > 0,
      allTables: allTablesResult.rows.map((row: any) => row.table_name)
    });

  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        error: 'Database test failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        errorType: typeof error,
        errorString: String(error),
        stack: error instanceof Error ? error.stack : undefined,
        databaseUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'Not set'
      },
      { status: 500 }
    );
  }
}