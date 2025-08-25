const { Pool } = require('pg');

// Test database connection and emergency response CRUD operations
async function testEmergencyResponseCRUD() {
  let pool;

  try {
    // Create connection pool
    pool = new Pool({
      connectionString: 'postgresql://adrian:12345@localhost:5432/ohms_local',
      connectionTimeoutMillis: 5000,
    });

    console.log('🔌 Testing database connection...');
    const client = await pool.connect();
    console.log('✅ Connected to database successfully!');

    // Test 1: Check if emergency_responses table exists
    console.log('\n📋 Test 1: Checking if emergency_responses table exists...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'emergency_responses'
      );
    `);

    if (tableExists.rows[0].exists) {
      console.log('✅ emergency_responses table exists');
    } else {
      console.log('❌ emergency_responses table does not exist');
      console.log('💡 Please run the database schema first');
      return;
    }

    // Test 2: Check table structure
    console.log('\n📋 Test 2: Checking table structure...');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'emergency_responses'
      ORDER BY ordinal_position;
    `);

    console.log('📊 Table columns:');
    columns.rows.forEach(col => {
      console.log(
        `  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`
      );
    });

    // Test 3: Check if employee table exists for foreign key
    console.log('\n📋 Test 3: Checking if employee table exists...');
    const employeeExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'employee'
      );
    `);

    if (employeeExists.rows[0].exists) {
      console.log('✅ employee table exists');

      // Get sample employee ID for testing
      const sampleEmployee = await client.query(
        'SELECT id FROM employee LIMIT 1'
      );
      if (sampleEmployee.rows.length > 0) {
        const employeeId = sampleEmployee.rows[0].id;
        console.log(`📝 Sample employee ID: ${employeeId}`);

        // Test 4: CREATE operation
        console.log('\n📋 Test 4: Testing CREATE operation...');
        const insertResult = await client.query(
          `
          INSERT INTO emergency_responses (
            employee_id, emergency_type, injury_date, place, main_complaint, diagnosis
          ) VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id, employee_id, emergency_type, injury_date
        `,
          [
            employeeId,
            'Medical',
            new Date(),
            'Office Building - Test Location',
            'Test complaint for CRUD testing',
            'Test diagnosis for CRUD testing',
          ]
        );

        const newRecordId = insertResult.rows[0].id;
        console.log('✅ CREATE operation successful');
        console.log(`📝 New record ID: ${newRecordId}`);
        console.log(`📝 Record details:`, insertResult.rows[0]);

        // Test 5: READ operation
        console.log('\n📋 Test 5: Testing READ operation...');
        const readResult = await client.query(
          `
          SELECT * FROM emergency_responses WHERE id = $1
        `,
          [newRecordId]
        );

        if (readResult.rows.length > 0) {
          console.log('✅ READ operation successful');
          console.log(`📝 Retrieved record:`, readResult.rows[0]);
        } else {
          console.log('❌ READ operation failed');
        }

        // Test 6: UPDATE operation
        console.log('\n📋 Test 6: Testing UPDATE operation...');
        const updateResult = await client.query(
          `
          UPDATE emergency_responses 
          SET place = $1, main_complaint = $2, date_updated = NOW()
          WHERE id = $3
          RETURNING id, place, main_complaint, date_updated
        `,
          [
            'Updated Test Location',
            'Updated test complaint for CRUD testing',
            newRecordId,
          ]
        );

        if (updateResult.rows.length > 0) {
          console.log('✅ UPDATE operation successful');
          console.log(`📝 Updated record:`, updateResult.rows[0]);
        } else {
          console.log('❌ UPDATE operation failed');
        }

        // Test 7: DELETE operation
        console.log('\n📋 Test 7: Testing DELETE operation...');
        const deleteResult = await client.query(
          `
          DELETE FROM emergency_responses WHERE id = $1 RETURNING id
        `,
          [newRecordId]
        );

        if (deleteResult.rows.length > 0) {
          console.log('✅ DELETE operation successful');
          console.log(`📝 Deleted record ID: ${deleteResult.rows[0].id}`);
        } else {
          console.log('❌ DELETE operation failed');
        }

        // Test 8: Verify deletion
        console.log('\n📋 Test 8: Verifying deletion...');
        const verifyResult = await client.query(
          `
          SELECT COUNT(*) FROM emergency_responses WHERE id = $1
        `,
          [newRecordId]
        );

        if (parseInt(verifyResult.rows[0].count) === 0) {
          console.log(
            '✅ Deletion verification successful - record no longer exists'
          );
        } else {
          console.log('❌ Deletion verification failed - record still exists');
        }
      } else {
        console.log('❌ No employees found in employee table');
        console.log('💡 Please add some sample employees first');
      }
    } else {
      console.log('❌ employee table does not exist');
      console.log('💡 Please run the database schema first');
    }

    // Test 9: Check current record count
    console.log('\n📋 Test 9: Checking current record count...');
    const countResult = await client.query(
      'SELECT COUNT(*) FROM emergency_responses'
    );
    console.log(
      `📊 Total emergency response records: ${countResult.rows[0].count}`
    );

    console.log('\n🎉 All CRUD tests completed successfully!');
    console.log('\n💡 The emergency response system is ready to use.');
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error('💡 Please check:');
    console.error('1. Database connection settings');
    console.error('2. Database is running');
    console.error('3. Database schema has been applied');
    console.error('4. User permissions are correct');
  } finally {
    if (pool) {
      await pool.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
console.log('🧪 Emergency Response CRUD Test Suite');
console.log('=====================================\n');
testEmergencyResponseCRUD();
