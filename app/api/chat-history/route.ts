import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  console.log('=== CHAT HISTORY API ROUTE START ===')
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

    console.log('📚 Fetching chat history from n8n webhook')
    console.log('🔗 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_HISTORY)
    console.log('🔗 Full webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_HISTORY)

    // Log request details
    console.log('📤 Making request with:')
    console.log('  - Method: GET')
    console.log('  - Headers:', {
      'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    })

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_HISTORY, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 Response received:')
    console.log('  - Status:', response.status)
    console.log('  - Status text:', response.statusText)
    console.log('  - OK:', response.ok)
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.log('❌ Response not OK, reading error response...')
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('❌ Chat history fetch failed:')
      console.error('  - Status:', response.status)
      console.error('  - Status text:', response.statusText)
      console.error('  - Error text:', errorText)
      console.error('  - Error text length:', errorText.length)
      
      // Handle 404 errors gracefully - return empty chat history
      if (response.status === 404) {
        console.log('n8n webhook not found (404) - returning empty chat history')
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      
      // Handle 500 workflow errors gracefully
      if (response.status === 500) {
        console.log('n8n webhook workflow error (500) - returning empty chat history')
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      
      return NextResponse.json(
        { error: `Failed to fetch chat history: ${response.status} ${response.statusText}`, details: errorText },
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
        console.log('📄 Empty response text, returning empty data array')
        result = { data: [] }
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

    console.log('✅ Chat history fetched successfully:')
    console.log('  - Result type:', typeof result)
    console.log('  - Result keys:', Object.keys(result))
    console.log('  - Has data property:', 'data' in result)
    console.log('  - Data type:', typeof result.data)
    console.log('  - Data is array:', Array.isArray(result.data))
    if (Array.isArray(result.data)) {
      console.log('  - Data array length:', result.data.length)
      console.log('  - First item:', result.data[0])
    }

    console.log('=== CHAT HISTORY API ROUTE END ===')
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error in chat history proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

