const { Pool } = require('pg');

// Try different connection methods
const configs = [
  {
    name: 'Connection String',
    config: {
      connectionString: 'postgresql://adrian:12345@localhost:5432/ohms_local',
    },
  },
  {
    name: 'Individual Parameters',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'ohms_local',
      user: 'postgres',
      password: '12345',
    },
  },
  {
    name: 'With SSL disabled',
    config: {
      host: 'localhost',
      port: 5432,
      database: 'ohms_local',
      user: 'postgres',
      password: '12345',
      ssl: false,
    },
  },
];

async function testConnection() {
  for (const { name, config } of configs) {
    console.log(`\n🧪 Testing ${name}...`);

    let pool;
    try {
      pool = new Pool({
        ...config,
        connectionTimeoutMillis: 5000,
      });

      const client = await pool.connect();
      console.log(`✅ ${name} - Connected to database!`);

      // Test basic query
      const result = await client.query(
        'SELECT NOW() as current_time, current_database() as db_name'
      );
      console.log(`✅ Query successful:`, result.rows[0]);

      // Test if tables exist
      const tables = await client.query(`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        ORDER BY tablename
        LIMIT 10
      `);

      console.log(`📊 Sample tables (${tables.rows.length} found):`);
      tables.rows.forEach(row => console.log(`  - ${row.tablename}`));

      // Test appointments table specifically
      try {
        const appointmentCount = await client.query(
          'SELECT COUNT(*) FROM appointments'
        );
        console.log(`📅 Appointments count: ${appointmentCount.rows[0].count}`);

        // Success! Update env file
        console.log(`\n🎯 SUCCESS! Update your .env.local with:`);
        if (config.connectionString) {
          console.log(`DATABASE_URL="${config.connectionString}"`);
        } else {
          console.log(`DATABASE_HOST="${config.host}"`);
          console.log(`DATABASE_PORT="${config.port}"`);
          console.log(`DATABASE_NAME="${config.database}"`);
          console.log(`DATABASE_USER="${config.user}"`);
          console.log(`DATABASE_PASSWORD="${config.password}"`);
          if (config.ssl === false) console.log(`DATABASE_SSL="false"`);
        }

        client.release();
        return; // Exit on first success
      } catch (err) {
        console.log(`❌ Appointments table error: ${err.message}`);
      }

      client.release();
    } catch (error) {
      console.error(`❌ ${name} failed:`);
      console.error(`   Code: ${error.code}`);
      console.error(`   Message: ${error.message}`);
    } finally {
      if (pool) {
        try {
          await pool.end();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    }
  }

  console.log('\n💡 None of the connection methods worked. Please check:');
  console.log('1. Is PostgreSQL service running?');
  console.log('2. Can you connect with psql or pgAdmin?');
  console.log('3. Are the credentials correct (postgres/postgress)?');
  console.log('4. Is the database name exactly "ohms_local"?');
}

testConnection();
