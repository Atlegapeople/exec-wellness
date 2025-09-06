import { Pool } from 'pg';

// Create a connection pool to the OHMS database
let pool: Pool | null = null;

export function getPool(): Pool {
  // Set SSL environment variable
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  
  if (!pool) {
    const isSupabase = process.env.DATABASE_URL?.includes('supabase.co') || process.env.DATABASE_URL?.includes('supabase.com');
    
    console.log('Creating new pool, isSupabase:', isSupabase);
    
    if (isSupabase) {
      // Use explicit configuration for Supabase to avoid parsing issues
      const config = {
        host: process.env.SUPABASE_HOST || 'aws-1-us-east-2.pooler.supabase.com',
        port: parseInt(process.env.SUPABASE_PORT || '5432'),
        database: process.env.SUPABASE_DATABASE || 'postgres',
        user: process.env.SUPABASE_USERNAME || 'postgres.ddvqatlnyytklwaldfaj',
        password: process.env.SUPABASE_PASSWORD || 'Taudidikhumo@1',
        ssl: { rejectUnauthorized: false },
        
        // Connection pool settings
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 20000,
        allowExitOnIdle: true,
        keepAlive: true
      };
      
      console.log('Pool config:', { 
        ...config, 
        password: '***',
        user: config.user,
        host: config.host 
      });
      pool = new Pool(config);
    } else {
      // Use connection string for local databases
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: false,
        
        // Connection pool settings
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 60000,
        allowExitOnIdle: true,
        keepAlive: true,
        keepAliveInitialDelayMillis: 0
      });
    }
  }

  return pool;
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const client = await pool.connect();
    
    // Test query
    await client.query('SELECT NOW()');
    
    client.release();
    return true;
  } catch {
    return false;
  }
}

// Query helper function
export async function query(text: string, params?: unknown[]): Promise<{ rows: unknown[] }> {
  let pool = getPool();
  
  try {
    console.log('Executing query:', text.substring(0, 100) + '...');
    const res = await pool.query(text, params);
    console.log('Query successful, rows:', res.rows.length);
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