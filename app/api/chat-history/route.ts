import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  // console.log('=== CHAT HISTORY API ROUTE START ===')

  try {
    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Authorization header missing or invalid')
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    const accessToken = authHeader.replace('Bearer ', '')

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_CHAT_HISTORY, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('❌ Chat history fetch failed:', response.status, response.statusText)

      // Handle 404 errors gracefully - return empty chat history
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: []
        })
      }

      // Handle 500 workflow errors gracefully
      if (response.status === 500) {
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
    let result
    try {
      const responseText = await response.text()

      if (!responseText || responseText.trim() === '') {
        result = { data: [] }
      } else {
        result = JSON.parse(responseText)
      }
    } catch (parseError) {
      console.error('❌ Error parsing JSON response:', parseError instanceof Error ? parseError.message : 'Unknown error')

      return NextResponse.json(
        { error: 'Invalid JSON response from webhook', parseError: parseError instanceof Error ? parseError.message : 'Unknown parsing error' },
        { status: 500 }
      )
    }

    // Ensure each conversation has agent_id field
    if (Array.isArray(result.data)) {
      result.data = result.data.map((conversation: any) => ({
        ...conversation,
        agent_id: conversation.agent_id || null
      }))
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error in chat history proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
