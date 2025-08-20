import { Pool } from 'pg';
import 'dotenv/config';
// Create a connection pool to the OHMS database
let pool: Pool | null = null;

export function getPool(): Pool {
  // Add validation for required environment variables
  if (!process.env.DATABASE_URL && !process.env.DATABASE_HOST) {
    throw new Error(
      'Either DATABASE_URL or DATABASE_HOST environment variable is required'
    );
  }

  if (!pool) {
    pool = new Pool({
      // Use connectionString if available, otherwise use individual params
      ...(process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
          }
        : {
            host: process.env.DATABASE_HOST,
            port: parseInt(process.env.DATABASE_PORT || '5432'),
            database: process.env.DATABASE_NAME,
            user: process.env.DATABASE_USER,
            password: process.env.DATABASE_PASSWORD,
            ssl:
              process.env.DATABASE_SSL === 'true'
                ? { rejectUnauthorized: false }
                : false,
          }),

      // Connection pool settings
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Handle pool errors
    pool.on('error', err => {
      console.error('Unexpected error on idle client:', err);
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
    console.log('Database connected successfully:', result.rows[0]);

    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Query helper function
export async function query(text: string, params?: any[]): Promise<any> {
  const pool = getPool();
  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    console.log('Executed query:', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error:', error);
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
