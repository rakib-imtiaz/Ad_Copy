import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { access_token, session_id, media_id } = body

    if (!access_token) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    if (!session_id) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    console.log('🔗 Proxying RAG upload request to n8n webhook')
    console.log('📊 Request data:', { media_id, session_id })

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_RAG_DOCUMENT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token,
        session_id,
        media_id
      })
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('❌ RAG upload failed:', response.status, response.statusText, errorText)
      return NextResponse.json(
        { error: `RAG upload failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Try to parse JSON response, but handle cases where response might be empty
    let result
    try {
      const responseText = await response.text()
      result = responseText ? JSON.parse(responseText) : { success: true }
    } catch (parseError) {
      console.log('⚠️ Could not parse JSON response, treating as success')
      result = { success: true }
    }
    
    console.log('✅ RAG upload successful:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('❌ Error in RAG upload proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
