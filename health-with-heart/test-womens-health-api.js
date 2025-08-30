// Test script for Women's Health API endpoints
// Run with: node test-womens-health-api.js

const BASE_URL = 'http://localhost:3000/api/womens-health';

async function testAPI() {
  console.log("🧪 Testing Women's Health API Endpoints...\n");

  try {
    // Test 1: GET - Fetch records
    console.log('1️⃣ Testing GET endpoint...');
    const getResponse = await fetch(`${BASE_URL}?limit=5`);
    const getData = await getResponse.json();
    console.log(
      `✅ GET successful: ${getData.womensHealth?.length || 0} records found`
    );

    if (getData.womensHealth && getData.womensHealth.length > 0) {
      const testRecord = getData.womensHealth[0];
      console.log(`📋 Test record ID: ${testRecord.id}`);

      // Test 2: PATCH - Partial update (gynecological section)
      console.log('\n2️⃣ Testing PATCH endpoint (gynecological section)...');
      const patchData = {
        id: testRecord.id,
        section: 'gynaecological',
        gynaecological_symptoms: 'No',
        hormonal_contraception: 'No',
      };

      const patchResponse = await fetch(BASE_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      });

      if (patchResponse.ok) {
        const patchResult = await patchResponse.json();
        console.log(`✅ PATCH successful: ${patchResult.message}`);
        console.log(
          `📝 Changed fields: ${patchResult.changedFields?.join(', ') || 'None'}`
        );
      } else {
        const error = await patchResponse.json();
        console.log(`❌ PATCH failed: ${error.error}`);
      }

      // Test 3: PUT - Full update
      console.log('\n3️⃣ Testing PUT endpoint...');
      const putData = {
        id: testRecord.id,
        breast_symptoms: 'No',
        mammogram_result: 'Normal',
      };

      const putResponse = await fetch(BASE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(putData),
      });

      if (putResponse.ok) {
        const putResult = await putResponse.json();
        console.log(`✅ PUT successful: ${putResult.message}`);
        console.log(
          `📝 Changed fields: ${putResult.changedFields?.join(', ') || 'None'}`
        );
      } else {
        const error = await putResponse.json();
        console.log(`❌ PUT failed: ${error.error}`);
      }

      // Test 4: PATCH - No changes (should return unchanged record)
      console.log('\n4️⃣ Testing PATCH endpoint (no changes)...');
      const noChangeData = {
        id: testRecord.id,
        section: 'breast',
        breast_symptoms: 'No', // Same value as before
      };

      const noChangeResponse = await fetch(BASE_URL, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noChangeData),
      });

      if (noChangeResponse.ok) {
        const noChangeResult = await noChangeResponse.json();
        console.log(
          `✅ PATCH (no changes) successful: ${noChangeResult.message}`
        );
        console.log(
          `📝 Changed fields: ${noChangeResult.changedFields?.join(', ') || 'None'}`
        );
      } else {
        const error = await noChangeResponse.json();
        console.log(`❌ PATCH (no changes) failed: ${error.error}`);
      }
    } else {
      console.log('⚠️ No records found to test with');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 API testing completed!');
}

// Run the test
testAPI();
