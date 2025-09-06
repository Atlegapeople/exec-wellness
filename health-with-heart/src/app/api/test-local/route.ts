import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'ohms_local',
    user: 'postgres',
    password: 'postgress',
    ssl: false,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Attempting to connect to local DB...');
    await client.connect();
    console.log('Connected to local DB successfully');
    
    // Test basic connection
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('Local query executed successfully');
    
    // Check what schemas exist
    const schemasResult = await client.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY schema_name
    `);
    
    // Check public tables
    const publicTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    // Check if users table exists and get sample structure
    let usersStructure = null;
    try {
      const usersColumnResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position
      `);
      usersStructure = usersColumnResult.rows;
    } catch (e) {
      console.log('Users table does not exist or cannot be accessed');
    }
    
    return NextResponse.json({
      success: true,
      database: 'local',
      currentTime: timeResult.rows[0].current_time,
      schemas: schemasResult.rows.map(row => row.schema_name),
      publicTables: publicTablesResult.rows.map(row => row.table_name),
      usersTableStructure: usersStructure
    });

  } catch (error) {
    console.error('Local DB connection error:', error);
    
    // Get more detailed error information
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : typeof error,
      code: (error as any)?.code,
      errno: (error as any)?.errno,
      syscall: (error as any)?.syscall,
      hostname: (error as any)?.hostname,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    return NextResponse.json({
      error: 'Local DB connection failed',
      details: errorDetails
    }, { status: 500 });
    
  } finally {
    try {
      await client.end();
    } catch (e) {
      console.error('Error closing local client:', e);
    }
  }
}