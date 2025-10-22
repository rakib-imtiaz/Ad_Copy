import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  console.log('=== RENAME CHAT API ROUTE START ===')
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

    // Get session_id and new_title from request body
    const body = await request.json()
    const sessionId = body.session_id
    const newTitle = body.new_title
    
    if (!sessionId) {
      console.log('❌ Session ID missing from request body')
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }
    
    if (!newTitle) {
      console.log('❌ New title missing from request body')
      return NextResponse.json({ error: 'New title required' }, { status: 400 })
    }
    
    console.log('📝 Session ID to rename:', sessionId)
    console.log('📝 New title:', newTitle)

    console.log('📝 Renaming chat session from n8n webhook')
    console.log('🔗 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.RENAME_CHAT)
    console.log('🔗 Full webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.RENAME_CHAT)

    // Log request details
    console.log('📤 Making request with:')
    console.log('  - Method: POST')
    console.log('  - Headers:', {
      'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    })
    console.log('  - Request body:', {
      access_token: accessToken,
      session_id: sessionId,
      'new-title': newTitle
    })

    const webhookUrl = API_ENDPOINTS.N8N_WEBHOOKS.RENAME_CHAT
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        session_id: sessionId,
        'new-title': newTitle
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    console.log('📊 Response received:')
    console.log('  - Status:', response.status)
    console.log('  - Status text:', response.statusText)
    console.log('  - OK:', response.ok)
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()))
    
    // Log the raw response text to see what the webhook returns
    const responseText = await response.text()
    console.log('📄 Raw webhook response:', responseText)

    if (!response.ok) {
      console.log('❌ Response not OK, reading error response...')
      console.error('❌ Chat rename failed:')
      console.error('  - Status:', response.status)
      console.error('  - Status text:', response.statusText)
      console.error('  - Error text:', responseText)
      console.error('  - Error text length:', responseText.length)
      
      return NextResponse.json(
        { error: `Failed to rename chat: ${response.status} ${response.statusText}`, details: responseText },
        { status: response.status }
      )
    }

    // Try to parse JSON response
    console.log('📄 Processing response text...')
    let result
    try {
      console.log('📄 Raw response text length:', responseText.length)
      console.log('📄 Raw response text (first 500 chars):', responseText.substring(0, 500))
      console.log('📄 Raw response text (last 500 chars):', responseText.substring(Math.max(0, responseText.length - 500)))
      
      if (!responseText || responseText.trim() === '') {
        console.log('📄 Empty response text, returning success')
        result = { success: true, message: 'Chat renamed successfully' }
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
      
      // If we can't parse the response but the status is OK, assume success
      if (response.ok) {
        result = { success: true, message: 'Chat renamed successfully' }
      } else {
        return NextResponse.json(
          { error: 'Invalid JSON response from webhook', parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error' },
          { status: 500 }
        )
      }
    }

    console.log('✅ Chat rename successful:')
    console.log('  - Result type:', typeof result)
    console.log('  - Result keys:', Object.keys(result))
    console.log('  - Success:', result.success)
    console.log('  - Message:', result.message)

    console.log('=== RENAME CHAT API ROUTE END ===')
    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error in chat rename proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
