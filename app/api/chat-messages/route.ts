import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  console.log('=== CHAT MESSAGES API ROUTE START ===')
  console.log('Timestamp:', new Date().toISOString())
  console.log('Request URL:', request.url)
  console.log('Request method:', request.method)
  
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    console.log('🔐 Auth header present:', !!authHeader)
    console.log('🔐 Auth header starts with Bearer:', authHeader?.startsWith('Bearer '))
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header missing or invalid')
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }
    
    const accessToken = authHeader.replace('Bearer ', '')
    console.log('🔐 Access token length:', accessToken.length)
    console.log('🔐 Access token preview:', accessToken.substring(0, 20) + '...')

    // Get session_id from query parameters
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    
    if (!sessionId) {
      console.log('❌ Session ID missing from query parameters')
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    console.log('📚 Session ID:', sessionId)

    console.log('📚 Fetching chat messages from n8n webhook')
    console.log('🔗 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_MESSAGES)
    console.log('🔗 Full webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_MESSAGES)

    // Log request details
    console.log('📤 Making request with:')
    console.log('  - Method: POST')
    console.log('  - Headers:', {
      'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    })
    console.log('  - Request body:', {
      access_token: accessToken,
      session_id: sessionId
    })

    const webhookUrl = API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_MESSAGES
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        session_id: sessionId
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    console.log('📊 Response received:')
    console.log('  - Status:', response.status)
    console.log('  - Status text:', response.statusText)
    console.log('  - OK:', response.ok)
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        console.log('❌ Response not OK, reading error response...')
        const errorText = await response.text().catch(() => 'Unable to read error response')
        console.error('❌ Chat messages fetch failed:')
        console.error('  - Status:', response.status)
        console.error('  - Status text:', response.statusText)
        console.error('  - Error text:', errorText)
        console.error('  - Error text length:', errorText.length)
        
        return NextResponse.json(
          { error: `Failed to fetch chat messages: ${response.status} ${response.statusText}`, details: errorText },
          { status: response.status }
        )
      }

    // Try to parse JSON response
    console.log('📄 Reading response text...')
    let result
    try {
      const responseText = await response.text()
      console.log('📄 Raw response text length:', responseText.length)
      console.log('📄 Raw response text (first 500 chars):', responseText.substring(0, 500))
      console.log('📄 Raw response text (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)))
      
      if (!responseText || responseText.trim() === '') {
        console.log('📄 Empty response text, returning empty messages array')
        result = { messages: [] }
      } else {
        console.log('📄 Parsing JSON response...')
        result = JSON.parse(responseText)
        console.log('📄 Parsed result type:', typeof result)
        console.log('📄 Parsed result keys:', Object.keys(result))
      }
    } catch (parseError) {
      console.error('❌ Error parsing JSON response:')
      console.error('  - Error:', parseError)
      console.error('  - Error message:', parseError instanceof Error ? parseError.message : 'Unknown error')
      console.error('  - Error stack:', parseError instanceof Error ? parseError.stack : 'No stack trace')
      
      return NextResponse.json(
        { error: 'Invalid JSON response from webhook', parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error' },
        { status: 500 }
      )
    }

    console.log('✅ Chat messages fetched successfully:')
    console.log('  - Result type:', typeof result)
    console.log('  - Result keys:', Object.keys(result))
    console.log('  - Has messages property:', 'messages' in result)
    console.log('  - Messages type:', typeof result.messages)
    console.log('  - Messages is array:', Array.isArray(result.messages))
    if (Array.isArray(result.messages)) {
      console.log('  - Messages array length:', result.messages.length)
      console.log('  - First message:', result.messages[0])
    }

    console.log('=== CHAT MESSAGES API ROUTE END ===')
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error in chat messages proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
