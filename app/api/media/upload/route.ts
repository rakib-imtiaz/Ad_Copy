import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    console.log('🔄 Proxying media upload request to n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_MEDIA_FILE)

    // Get the FormData from the request
    const formData = await request.formData()
    
    // Forward the FormData to n8n
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_MEDIA_FILE, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type for FormData, let the browser set it with boundary
      },
      body: formData,
    })

    console.log('n8n response status:', response.status)

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText)
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('Error response:', errorText)
      
      return NextResponse.json(
        { error: `n8n webhook failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ n8n webhook success:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ Error in media upload proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
