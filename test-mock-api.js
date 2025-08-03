// Simple test script to verify mock API endpoints
// Run with: node test-mock-api.js

const BASE_URL = 'http://localhost:3000/api/mock'

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await fetch(`${BASE_URL}${endpoint}`, options)
    const data = await response.json()
    
    console.log(`✅ ${method} ${endpoint}:`, response.status)
    console.log('   Response:', JSON.stringify(data, null, 2))
    console.log('')
    
    return data
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}:`, error.message)
    console.log('')
  }
}

async function runTests() {
  console.log('🧪 Testing AdCopy Mock API\n')
  
  // Test authentication endpoints
  await testEndpoint('/auth/login', 'POST', {
    email: 'test@example.com',
    password: 'password123'
  })
  
  // Test agents list
  await testEndpoint('/agents/list')
  
  // Test agent run
  await testEndpoint('/agent/run', 'POST', {
    user_id: 'user_123',
    agent_id: 'agent-1',
    message: 'Hello, I need help with ad copy'
  })
  
  // Test knowledge base list
  await testEndpoint('/kb/list?user_id=user_123')
  
  // Test conversation list
  await testEndpoint('/conversation/list?user_id=user_123')
  
  // Test conversation get
  await testEndpoint('/conversation/get?id=conv-1')
  
  // Test media list
  await testEndpoint('/media/list?user_id=user_123')
  
  // Test organization brand settings
  await testEndpoint('/org/brand')
  
  // Test usage metrics
  await testEndpoint('/usage/orgMonth?org_id=org_456')
  
  console.log('🎉 Mock API tests completed!')
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error)
} 