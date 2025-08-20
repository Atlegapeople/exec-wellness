const { Pool } = require('pg');

const commonPorts = [5432, 5433, 5434, 3000, 5430];
const commonHosts = ['localhost', '127.0.0.1', 'host.docker.internal'];

async function findPostgres() {
  console.log('🔍 Searching for PostgreSQL connection...');
  
  for (const host of commonHosts) {
    for (const port of commonPorts) {
      try {
        const connectionString = `postgresql://postgres:postgress@${host}:${port}/ohms_local`;
        console.log(`\n🧪 Testing: ${connectionString}`);
        
        const pool = new Pool({
          connectionString,
          connectionTimeoutMillis: 3000
        });
        
        const client = await pool.connect();
        const result = await client.query('SELECT version()');
        
        console.log(`✅ SUCCESS! Found PostgreSQL at ${host}:${port}`);
        console.log(`📊 Version: ${result.rows[0].version.substring(0, 50)}...`);
        
        // Test ohms_local database
        try {
          const dbResult = await client.query('SELECT current_database()');
          console.log(`🗄️  Connected to database: ${dbResult.rows[0].current_database}`);
          
          // Count tables
          const tables = await client.query(`
            SELECT count(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
          `);
          console.log(`📋 Tables found: ${tables.rows[0].count}`);
          
        } catch (dbErr) {
          console.log(`❌ Database error: ${dbErr.message}`);
        }
        
        client.release();
        await pool.end();
        
        console.log(`\n🎯 UPDATE YOUR .env.local FILE:`);
        console.log(`DATABASE_URL="${connectionString}"`);
        return;
        
      } catch (error) {
        // Silent fail, continue searching
      }
    }
  }
  
  console.log('\n❌ PostgreSQL not found on any common host:port combination');
  console.log('\n💡 Please check:');
  console.log('1. Is PostgreSQL running?');
  console.log('2. What port is it using?');
  console.log('3. Is it in Docker or local install?');
  console.log('4. Can you connect with pgAdmin or another tool?');
}

findPostgres();