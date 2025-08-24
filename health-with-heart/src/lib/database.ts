import { Pool } from 'pg';

// Create a connection pool to the OHMS database
let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // Alternative configuration if you prefer individual env vars:
      // host: process.env.DATABASE_HOST,
      // port: parseInt(process.env.DATABASE_PORT || '5432'),
      // database: process.env.DATABASE_NAME,
      // user: process.env.DATABASE_USER,
      // password: process.env.DATABASE_PASSWORD,
      // ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      
      // Connection pool settings
      max: 10, // Maximum number of clients in pool
      idleTimeoutMillis: 10000, // Close idle clients after 10 seconds
      connectionTimeoutMillis: 30000, // Return error if connection takes longer than 30 seconds
      allowExitOnIdle: true // Allow pool to exit when all clients are idle
    });

  }

  return pool;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const client = await pool.connect();
    
    // Test query
    const result = await client.query('SELECT NOW()');
    
    client.release();
    return true;
  } catch (error) {
    return false;
  }
}

// Query helper function
export async function query(text: string, params?: any[]): Promise<any> {
  let pool = getPool();
  
  try {
    const res = await pool.query(text, params);
    return res;
  } catch (error) {
    // If we get a connection error, try resetting the pool once
    if (error instanceof Error && (
      error.message.includes('Connection terminated') ||
      error.message.includes('connect ECONNREFUSED') ||
      error.message.includes('Client has encountered a connection error')
    )) {
      resetPool();
      pool = getPool();
      const res = await pool.query(text, params);
      return res;
    }
    throw error;
  }
}

// Close pool (for graceful shutdown)
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Reset pool (for connection issues)
export function resetPool(): void {
  if (pool) {
    pool.end().catch(() => {}); // Ignore errors during cleanup
    pool = null;
  }
}