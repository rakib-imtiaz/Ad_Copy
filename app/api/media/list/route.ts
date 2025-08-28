import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    console.log('🔄 Proxying media list request to n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.LIST_MEDIA_FILES)

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.LIST_MEDIA_FILES, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
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
    console.log('📊 Raw data structure:', JSON.stringify(data, null, 2))

    // Extract the actual media items from the n8n response
    let mediaItems = []
    if (data && Array.isArray(data) && data.length > 0) {
      // Handle the structure: [ { all_records: [...] } ]
      if (data[0] && data[0].all_records && Array.isArray(data[0].all_records)) {
        mediaItems = data[0].all_records
        console.log('📊 Extracted media items:', mediaItems.length)
      } else {
        // Fallback: try to use the data directly
        mediaItems = data
        console.log('📊 Using data directly as media items:', mediaItems.length)
      }
    }

    console.log('📊 Final media items to return:', mediaItems.length)
    return NextResponse.json({ data: mediaItems })
  } catch (error) {
    console.error('❌ Error in media list proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
