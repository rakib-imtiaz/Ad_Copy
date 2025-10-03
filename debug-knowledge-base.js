// Debug script for Knowledge Base webhook
// Run this in browser console to test the webhook directly

console.log('=== KNOWLEDGE BASE WEBHOOK DEBUG SCRIPT ===');

// Get the access token from localStorage
const accessToken = localStorage.getItem('auth_token');
console.log('🔐 Access Token Found:', !!accessToken);
console.log('🔐 Token Length:', accessToken ? accessToken.length : 0);
console.log('🔐 Token Preview:', accessToken ? accessToken.substring(0, 30) + '...' : 'No token');

if (!accessToken) {
  console.error('❌ No access token found in localStorage');
  console.log('💡 Make sure you are logged in first');
} else {
  // Test the webhook directly
  const webhookUrl = 'https://n8n.srv934833.hstgr.cloud/webhook/see-knowledgebase-data';
  
  console.log('📡 Testing webhook URL:', webhookUrl);
  console.log('📤 Request Details:');
  console.log('  - Method: GET');
  console.log('  - Headers: Authorization: Bearer [token]');
  console.log('  - Content-Type: application/json');
  
  fetch(webhookUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('📊 Response received:');
    console.log('  - Status:', response.status);
    console.log('  - Status Text:', response.statusText);
    console.log('  - OK:', response.ok);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      return response.json();
    } else {
      return response.text().then(text => {
        throw new Error(`HTTP ${response.status}: ${text}`);
      });
    }
  })
  .then(data => {
    console.log('✅ Success Response:');
    console.log('  - Data Type:', typeof data);
    console.log('  - Data Structure:', Array.isArray(data) ? 'Array' : 'Object');
    console.log('  - Full Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('❌ Error occurred:');
    console.error('  - Error Type:', error.constructor.name);
    console.error('  - Error Message:', error.message);
    console.error('  - Full Error:', error);
  });
}

console.log('=== DEBUG SCRIPT COMPLETED ===');







