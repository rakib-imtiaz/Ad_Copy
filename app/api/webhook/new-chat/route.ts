import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }

    // Get the request body to extract agent_id
    const body = await request.json()
    const { agent_id } = body

    // Extract access token from authorization header
    const accessToken = authHeader.replace('Bearer ', '')

    console.log('🔄 Proxying new chat request to n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.NEW_CHAT)
    console.log('Agent ID:', agent_id || 'Not provided')
    console.log('Access Token:', accessToken ? '***' + accessToken.slice(-4) : 'Not provided')

    // Forward the request to n8n webhook
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.NEW_CHAT, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id,
        access_token: accessToken
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    console.log('n8n response status:', response.status)

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText)
      const errorData = await response.text()
      console.error('n8n error details:', errorData)
      
      return NextResponse.json(
        { error: `n8n webhook failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Check if response has content before trying to parse JSON
    const responseText = await response.text()
    console.log('Raw n8n response:', responseText)
    
    let data
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText)
        console.log('✅ n8n webhook success:', data)
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        console.log('Response text:', responseText)
        // Return the raw text as a fallback
        return NextResponse.json({
          response: responseText || 'Received response from n8n (not JSON)',
          raw_response: responseText
        })
      }
    } else {
      console.log('⚠️ n8n webhook returned empty response')
      data = {
        response: 'Received empty response from n8n webhook',
        empty_response: true
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying new chat request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
