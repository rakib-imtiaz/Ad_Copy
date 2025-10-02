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

    // Get the request body
    const body = await request.json()
    const { resource_id, updated_content } = body

    if (!resource_id || !updated_content) {
      return NextResponse.json(
        { error: 'resource_id and updated_content are required' },
        { status: 400 }
      )
    }

    // Extract access token from authorization header
    const accessToken = authHeader.replace('Bearer ', '')

    console.log('📝 Proxying update webpage content request to n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.UPDATE_WEBPAGE_CONTENT)
    console.log('Resource ID:', resource_id)
    console.log('Content Length:', updated_content.length)
    console.log('Access Token:', accessToken ? '***' + accessToken.slice(-4) : 'Not provided')

    // Forward the request to n8n webhook
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPDATE_WEBPAGE_CONTENT, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken,
        resource_id: resource_id,
        updated_content: updated_content
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    console.log('n8n update webpage content response status:', response.status)

    if (!response.ok) {
      console.error('n8n update webpage content webhook failed:', response.status, response.statusText)
      const errorData = await response.text()
      console.error('n8n error details:', errorData)
      
      return NextResponse.json(
        { error: `n8n webhook failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Check if response has content before trying to parse JSON
    const responseText = await response.text()
    console.log('Raw n8n update webpage content response:', responseText)
    
    let data
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText)
        console.log('✅ n8n update webpage content webhook success:', data)
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
      console.log('⚠️ n8n update webpage content webhook returned empty response')
      data = {
        response: 'Content updated successfully',
        empty_response: true
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying update webpage content request:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout - n8n webhook took too long to respond' },
          { status: 408 }
        )
      }
      
      return NextResponse.json(
        { error: `Network error: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
