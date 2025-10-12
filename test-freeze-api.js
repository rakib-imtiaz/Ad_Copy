// Test script for account freeze functionality
// This script tests the freeze account API endpoint

const testFreezeAccount = async () => {
  const testData = {
    accessToken: 'test-token',
    freeze_email: 'test@example.com',
    freeze_status: true,
    freeze_duration: 7
  };

  try {
    console.log('Testing freeze account API...');
    console.log('Test data:', testData);
    
    const response = await fetch('http://localhost:3000/api/admin/freeze-account', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('Response status:', response.status);
    const result = await response.json();
    console.log('Response data:', result);
    
    if (response.ok) {
      console.log('✅ Freeze account API test passed');
    } else {
      console.log('❌ Freeze account API test failed');
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testFreezeAccount();
