import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTH_ERROR",
            message: "Authorization header is required"
          }
        },
        { status: 401 }
      )
    }

    console.log('Agent list API called')
    console.log('Making request to n8n webhook with access token')

    // Call the n8n webhook
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.AGENT_LIST, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    console.log('N8N webhook response status:', response.status)

    if (!response.ok) {
      console.error('N8N webhook failed with status:', response.status)
      const errorText = await response.text()
      console.error('N8N webhook error response:', errorText)
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "N8N_ERROR",
            message: `N8N webhook failed with status ${response.status}`,
            details: errorText
          }
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('N8N webhook response data:', data)

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error in agent list API:', error)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred"
        }
      },
      { status: 500 }
    )
  }
}
