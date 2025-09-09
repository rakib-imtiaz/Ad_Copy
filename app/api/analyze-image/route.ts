import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json()
    const { media_id } = body

    if (!media_id) {
      return NextResponse.json(
        { error: 'media_id is required' },
        { status: 400 }
      )
    }

    // Get the access token from request headers
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    console.log('🔍 Analyzing image with media_id:', media_id)
    console.log('🔍 Access token present:', !!accessToken)
    console.log('🔍 Access token length:', accessToken?.length || 0)

    if (!accessToken) {
      console.error('❌ No access token provided')
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      )
    }

    console.log('🔍 Analyzing image with media_id:', media_id)

    // Call the n8n webhook
    const webhookUrl = API_ENDPOINTS.N8N_WEBHOOKS.ANALYZE_IMAGE
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'access_token': accessToken
      },
      body: JSON.stringify({
        media_id: media_id
      })
    })

    if (!response.ok) {
      console.error('❌ Webhook error:', response.status, response.statusText)
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('❌ Error response body:', errorText)
      return NextResponse.json(
        { error: `Webhook error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      )
    }

    // Check if response has content before parsing
    const responseText = await response.text()
    console.log('🔍 Raw response:', responseText)
    
    if (!responseText || responseText.trim() === '') {
      console.error('❌ Empty response from webhook')
      return NextResponse.json(
        { error: 'Empty response from image analysis webhook' },
        { status: 500 }
      )
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('❌ Response text that failed to parse:', responseText)
      return NextResponse.json(
        { error: 'Invalid JSON response from webhook', response: responseText },
        { status: 500 }
      )
    }
    
    console.log('✅ Image analysis completed:', result)

    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('❌ Error in analyze-image API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
