import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }
    
    const accessToken = authHeader.replace('Bearer ', '')

    console.log('📚 Fetching chat history from n8n webhook')
    console.log('🔗 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_HISTORY)

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_HISTORY, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📊 Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('❌ Chat history fetch failed:', response.status, response.statusText, errorText)
      return NextResponse.json(
        { error: `Failed to fetch chat history: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Try to parse JSON response
    let result
    try {
      const responseText = await response.text()
      console.log('📄 Raw response text:', responseText)
      
      result = responseText ? JSON.parse(responseText) : { data: [] }
    } catch (parseError) {
      console.error('❌ Error parsing JSON response:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON response from webhook' },
        { status: 500 }
      )
    }

    console.log('✅ Chat history fetched successfully:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error in chat history proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

