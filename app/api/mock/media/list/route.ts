import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('Media library API endpoint called')
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No authorization header provided')
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const accessToken = authHeader.substring(7) // Remove 'Bearer ' prefix
    console.log('Making request to n8n webhook with access token')

    // Make request to n8n webhook
    const response = await fetch(
      'https://n8n.srv934833.hstgr.cloud/webhook/view-media-library',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('N8N webhook response status:', response.status)

    if (!response.ok) {
      console.log('N8N webhook request failed with status:', response.status)
      
      // If it's a 404, return empty array instead of error
      if (response.status === 404) {
        console.log('Returning empty array for 404 response')
        return NextResponse.json([])
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch media library data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('N8N webhook response data:', data)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching media library:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 