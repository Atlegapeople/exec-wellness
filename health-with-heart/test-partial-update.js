// Simple test script for the partial update API endpoint
// Run this with: node test-partial-update.js

const testPartialUpdate = async () => {
  const baseUrl = 'http://localhost:3000';
  const testId = '1'; // Replace with an actual record ID from your database

  console.log('Testing partial update API endpoint...\n');

  // Test 1: Update with changed values
  console.log('Test 1: Updating with changed values...');
  try {
    const response1 = await fetch(`${baseUrl}/api/mens-health/partial-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testId,
        prostate_enlarged: true,
        prostate_infection: false,
      }),
    });

    const result1 = await response1.json();
    console.log('Response 1:', result1);
    console.log('Status:', response1.status);
    console.log('Changed fields:', result1.changedFields);
    console.log('Unchanged:', result1.unchanged);
    console.log('---\n');
  } catch (error) {
    console.error('Test 1 failed:', error);
  }

  // Test 2: Update with same values (should detect no changes)
  console.log(
    'Test 2: Updating with same values (should detect no changes)...'
  );
  try {
    const response2 = await fetch(`${baseUrl}/api/mens-health/partial-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testId,
        prostate_enlarged: true, // Same value as before
        prostate_infection: false, // Same value as before
      }),
    });

    const result2 = await response2.json();
    console.log('Response 2:', result2);
    console.log('Status:', response2.status);
    console.log('Changed fields:', result2.changedFields);
    console.log('Unchanged:', result2.unchanged);
    console.log('---\n');
  } catch (error) {
    console.error('Test 2 failed:', error);
  }

  // Test 3: Update with mixed changed/unchanged values
  console.log('Test 3: Updating with mixed changed/unchanged values...');
  try {
    const response3 = await fetch(`${baseUrl}/api/mens-health/partial-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: testId,
        prostate_enlarged: true, // Same value (should not change)
        prostate_cancer: true, // New value (should change)
        notes_text: 'Updated test notes', // New value (should change)
      }),
    });

    const result3 = await response3.json();
    console.log('Response 3:', result3);
    console.log('Status:', response3.status);
    console.log('Changed fields:', result3.changedFields);
    console.log('Unchanged:', result3.unchanged);
    console.log('---\n');
  } catch (error) {
    console.error('Test 3 failed:', error);
  }

  console.log('Testing completed!');
};

// Run the test
testPartialUpdate().catch(console.error);
