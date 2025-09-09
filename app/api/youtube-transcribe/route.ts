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

    // Step 1: Call the n8n webhook for YouTube transcription to get resource-id
    const webhookUrl = `${API_ENDPOINTS.N8N_WEBHOOKS.YOUTUBE_TRANSCRIBE}?url=${encodeURIComponent(url)}`
    console.log('🎥 Step 1 - Full webhook URL:', webhookUrl)
    
    const response = await fetch(webhookUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Step 1 - N8N webhook response status:', response.status)

    if (!response.ok) {
      console.error('❌ Step 1 - N8N webhook failed with status:', response.status)
      const errorText = await response.text()
      console.error('❌ Step 1 - N8N webhook error response:', errorText)
      
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

    // Parse the first response to get resource-id
    const responseText = await response.text()
    console.log('📡 Step 1 - Response text length:', responseText.length)
    console.log('📡 Step 1 - Response text preview:', responseText.substring(0, 200))

    if (!responseText || responseText.trim() === '') {
      console.log('⚠️ Step 1 - n8n webhook returned empty response, but transcription might be processing')
      // Return a success response indicating the transcription was submitted
      return NextResponse.json({
        success: true,
        data: {
          status: 'processing',
          message: 'YouTube transcription submitted successfully. It will be available shortly in your media library.',
          url: url
        }
      })
    }

    let step1Data
    try {
      step1Data = JSON.parse(responseText)
      console.log('✅ Step 1 - n8n webhook success:', step1Data)
    } catch (parseError) {
      console.error('❌ Step 1 - Failed to parse JSON response:', parseError)
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

    // Extract resource-id from the response
    const resourceId = step1Data.resource_id || step1Data.resourceId || step1Data.id
    if (!resourceId) {
      console.error('❌ Step 1 - No resource-id found in response:', step1Data)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NO_RESOURCE_ID",
            message: "No resource ID received from transcription service"
          }
        },
        { status: 500 }
      )
    }

    console.log('🎥 Step 1 - Resource ID received:', resourceId)

    // Step 2: Get the actual transcription content using the resource-id
    console.log('🎥 Step 2 - Getting transcription content from database')
    const contentUrl = `${API_ENDPOINTS.N8N_WEBHOOKS.EXTRA_RESOURCES_CONTENT_EXTRACT}?resource-id=${encodeURIComponent(resourceId)}`
    console.log('🎥 Step 2 - Full content URL:', contentUrl)
    
    const contentResponse = await fetch(contentUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 Step 2 - Content response status:', contentResponse.status)

    if (!contentResponse.ok) {
      console.error('❌ Step 2 - Content extraction failed with status:', contentResponse.status)
      const errorText = await contentResponse.text()
      console.error('❌ Step 2 - Content extraction error response:', errorText)
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONTENT_EXTRACTION_ERROR",
            message: `Content extraction failed with status ${contentResponse.status}`,
            details: errorText
          }
        },
        { status: contentResponse.status }
      )
    }

    // Parse the content response
    const contentText = await contentResponse.text()
    console.log('📡 Step 2 - Content response length:', contentText.length)
    console.log('📡 Step 2 - Content response preview:', contentText.substring(0, 200))

    if (!contentText || contentText.trim() === '') {
      console.log('❌ Step 2 - Content extraction returned empty response')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "EMPTY_CONTENT",
            message: "No transcription content received"
          }
        },
        { status: 500 }
      )
    }

    let contentData
    try {
      contentData = JSON.parse(contentText)
      console.log('✅ Step 2 - Content extraction success:', contentData)
    } catch (parseError) {
      console.error('❌ Step 2 - Failed to parse content JSON response:', parseError)
      console.error('Raw content text:', contentText)
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONTENT_PARSE_ERROR",
            message: "Failed to parse transcription content"
          }
        },
        { status: 500 }
      )
    }

    // Return the combined data
    return NextResponse.json({
      success: true,
      data: {
        ...contentData,
        resource_id: resourceId,
        original_response: step1Data
      }
    }, { status: 200 })
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
