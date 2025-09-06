import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function GET() {
  // Parse the DATABASE_URL to get connection details
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 });
  }

  const url = new URL(databaseUrl);
  
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port),
    database: url.pathname.slice(1), // Remove leading /
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });
  
  console.log('Connection details:', {
    host: url.hostname,
    port: url.port,
    database: url.pathname.slice(1),
    user: url.username
  });

  try {
    console.log('Attempting to connect...');
    await client.connect();
    console.log('Connected successfully');
    
    // Test basic connection
    const timeResult = await client.query('SELECT NOW() as current_time');
    console.log('Query executed successfully');
    
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
    
    // Check auth tables
    const authTablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'auth'
      ORDER BY table_name
    `);
    
    return NextResponse.json({
      success: true,
      currentTime: timeResult.rows[0].current_time,
      schemas: schemasResult.rows.map(row => row.schema_name),
      publicTables: publicTablesResult.rows.map(row => row.table_name),
      authTables: authTablesResult.rows.map(row => row.table_name)
    });

  } catch (error) {
    console.error('Direct connection error:', error);
    
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
      error: 'Direct connection failed',
      details: errorDetails
    }, { status: 500 });
    
  } finally {
    try {
      await client.end();
    } catch (e) {
      console.error('Error closing client:', e);
    }
  }
}