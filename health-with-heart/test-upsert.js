// Test script for the upsert API endpoint
// Run this with: node test-upsert.js

const testUpsert = async () => {
  const baseUrl = 'http://localhost:3000';

  console.log('Testing upsert API endpoint...\n');

  // Test 1: Insert new record (should create)
  console.log('Test 1: Inserting new record (should create)...');
  try {
    const response1 = await fetch(`${baseUrl}/api/mens-health/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: '1', // Replace with actual employee ID
        report_id: 'REP001', // Replace with actual report ID
        prostate_enlarged: true,
        prostate_infection: false,
        notes_header: 'Initial assessment',
        notes_text: 'Patient shows signs of prostate enlargement.',
      }),
    });

    const result1 = await response1.json();
    console.log('Response 1:', result1);
    console.log('Status:', response1.status);
    console.log('Operation:', result1.operation);
    console.log('Employee Name:', result1.employeeName);
    console.log('---\n');
  } catch (error) {
    console.error('Test 1 failed:', error);
  }

  // Test 2: Update existing record (should update)
  console.log('Test 2: Updating existing record (should update)...');
  try {
    const response2 = await fetch(`${baseUrl}/api/mens-health/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: '1', // Same employee ID as Test 1
        report_id: 'REP001', // Same report ID as Test 1
        prostate_enlarged: true,
        prostate_infection: true, // Changed from false to true
        prostate_cancer: false, // New field
        notes_header: 'Updated assessment',
        notes_text:
          'Patient shows signs of both prostate enlargement and infection.',
        recommendation_text: 'Schedule urologist appointment.',
      }),
    });

    const result2 = await response2.json();
    console.log('Response 2:', result2);
    console.log('Status:', response2.status);
    console.log('Operation:', result2.operation);
    console.log('Employee Name:', result2.employeeName);
    console.log('Existing ID:', result2.existingId);
    console.log('---\n');
  } catch (error) {
    console.error('Test 2 failed:', error);
  }

  // Test 3: Insert another new record
  console.log('Test 3: Inserting another new record...');
  try {
    const response3 = await fetch(`${baseUrl}/api/mens-health/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: '2', // Different employee ID
        report_id: 'REP002', // Different report ID
        ever_diagnosed_with: 'Testicular condition',
        testes_growth: true,
        erections: false,
        require_urologist: true,
        notes_header: 'Testicular assessment',
        notes_text: 'Patient reports testicular growth concerns.',
        recommendation_text: 'Immediate urologist consultation required.',
      }),
    });

    const result3 = await response3.json();
    console.log('Response 3:', result3);
    console.log('Status:', response3.status);
    console.log('Operation:', result3.operation);
    console.log('Employee Name:', result3.employeeName);
    console.log('---\n');
  } catch (error) {
    console.error('Test 3 failed:', error);
  }

  // Test 4: Insert with missing required fields (should fail)
  console.log(
    'Test 4: Inserting with missing required fields (should fail)...'
  );
  try {
    const response4 = await fetch(`${baseUrl}/api/mens-health/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: '3', // Missing report_id
        prostate_enlarged: true,
      }),
    });

    const result4 = await response4.json();
    console.log('Response 4:', result4);
    console.log('Status:', response4.status);
    console.log('Error:', result4.error);
    console.log('---\n');
  } catch (error) {
    console.error('Test 4 failed:', error);
  }

  console.log('Testing completed!');
};

// Run the test
testUpsert().catch(console.error);
