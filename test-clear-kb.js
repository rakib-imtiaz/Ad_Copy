// Test script for clear knowledge base functionality
// This script tests the clear knowledge base API endpoint

const testClearKnowledgeBase = async () => {
  const testData = {
    accessToken: 'test-token'
  };

  try {
    console.log('Testing clear knowledge base API...');
    console.log('Test data:', testData);
    
    const response = await fetch('http://localhost:3000/api/knowledge-base/clear', {
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
      console.log('✅ Clear knowledge base API test passed');
    } else {
      console.log('❌ Clear knowledge base API test failed');
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
};

// Run the test
testClearKnowledgeBase();
