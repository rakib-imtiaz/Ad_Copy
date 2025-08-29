import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const authHeader = request.headers.get('authorization')

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_URL",
            message: "YouTube URL is required"
          }
        },
        { status: 400 }
      )
    }

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

    console.log('🎥 YouTube transcription API called')
    console.log('🎥 URL:', url)
    console.log('🎥 Making request to n8n webhook')

    // Call the n8n webhook for YouTube transcription
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.YOUTUBE_TRANSCRIBE, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url
      }),
    })

    console.log('📡 N8N webhook response status:', response.status)

    if (!response.ok) {
      console.error('❌ N8N webhook failed with status:', response.status)
      const errorText = await response.text()
      console.error('❌ N8N webhook error response:', errorText)
      
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

    // Check if response has content before parsing JSON
    const responseText = await response.text()
    console.log('📡 Response text length:', responseText.length)
    console.log('📡 Response text preview:', responseText.substring(0, 200))

    if (!responseText || responseText.trim() === '') {
      console.log('❌ n8n webhook returned empty response')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_RESPONSE",
            message: "No transcription data received"
          }
        },
        { status: 500 }
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
      console.log('✅ n8n webhook success:', data)
      
      return NextResponse.json({
        success: true,
        data: data
      }, { status: 200 })
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      console.error('Raw response text:', responseText)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PARSE_ERROR",
            message: "Failed to parse transcription response"
          }
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('❌ Error in YouTube transcription API:', error)
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
