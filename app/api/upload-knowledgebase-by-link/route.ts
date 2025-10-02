import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    console.log('=== UPLOAD KNOWLEDGE BASE BY LINK API START ===')
    console.log('Timestamp:', new Date().toISOString())
    
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      console.log('❌ No authorization header found')
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

    console.log('✅ Authorization header found')

    // Parse the request body
    const body = await request.json()
    const { access_token, url } = body

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "URL is required"
          }
        },
        { status: 400 }
      )
    }

    if (!access_token) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "access_token is required"
          }
        },
        { status: 400 }
      )
    }

    console.log('📋 URL to scrape:', url)
    console.log('📋 Access token provided:', access_token ? 'Yes' : 'No')

    // Use the webhook endpoint from configuration
    const webhookUrl = API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE_BY_LINK
    console.log('🔗 Webhook URL being used:', webhookUrl)
    
    // Prepare request to n8n webhook
    const requestBody = JSON.stringify({
      access_token: access_token,
      url: url
    })

    // Use Bearer authentication for the webhook (consistent with other API routes)
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
    }
    
    console.log('📤 Sending scrape request to n8n webhook:', {
      url: webhookUrl,
      data_type: 'JSON',
      data_size: requestBody.length,
      target_url: url,
      auth_method: 'Bearer'
    })
    
    // Debug: Log the actual data being sent
    console.log('🔍 Data being sent to webhook:')
    console.log(JSON.stringify(JSON.parse(requestBody), null, 2))

    // Call the n8n webhook
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout for scraping and processing
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)

      console.log('📊 N8N webhook response status:', response.status)
      console.log('📊 N8N webhook response headers:', Object.fromEntries(response.headers.entries()))

      // Try to get response text first
      const responseText = await response.text()
      console.log('📊 N8N webhook response text length:', responseText.length)
      console.log('📊 N8N webhook response text:', responseText)

      if (!response.ok) {
        console.error('❌ N8N webhook failed with status:', response.status)
        console.error('❌ N8N webhook error response:', responseText)
        
        // Try to parse as JSON if possible
        let errorDetails = responseText
        try {
          if (responseText.trim()) {
            const errorJson = JSON.parse(responseText)
            errorDetails = JSON.stringify(errorJson, null, 2)
          } else {
            errorDetails = 'Empty response from webhook'
          }
        } catch (e) {
          // If not JSON, use as text
          errorDetails = responseText || 'No response content'
        }
        
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "N8N_ERROR",
              message: `N8N webhook failed with status ${response.status}`,
              details: errorDetails
            }
          },
          { status: response.status }
        )
      }

      // Try to parse response as JSON
      let data
      try {
        if (responseText.trim()) {
          data = JSON.parse(responseText)
          console.log('N8N webhook response data:', data)
        } else {
          console.log('Empty response from webhook, providing default success response')
          data = { 
            success: true,
            message: 'URL scraped and knowledge base updated successfully',
            data: {
              url: url,
              processed_at: new Date().toISOString(),
              status: 'success'
            }
          }
        }
      } catch (e) {
        console.log('Response is not JSON, treating as text:', responseText)
        data = { 
          success: true,
          message: responseText || 'URL scraped and knowledge base updated successfully',
          data: {
            url: url,
            processed_at: new Date().toISOString(),
            status: 'success',
            content: responseText
          }
        }
      }

      // If n8n webhook returns an error, return the error
      if (response.status === 500 || responseText.trim() === '' || !data.success) {
        console.log('🔍 Webhook error details:', {
          status: response.status,
          responseText: responseText,
          data: data
        })
        
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "N8N_WEBHOOK_ERROR",
              message: `N8N webhook failed with status ${response.status}`,
              details: responseText || 'No response from webhook'
            }
          },
          { status: response.status }
        )
      }

      return NextResponse.json(data, { status: 200 })
      
    } catch (fetchError) {
      clearTimeout(timeoutId)
      console.error('Error calling n8n webhook:', fetchError)
      
      // Type guard to check if fetchError is an Error object
      if (fetchError instanceof Error) {
        if (fetchError.name === 'AbortError') {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "TIMEOUT_ERROR",
                message: "Request to n8n webhook timed out"
              }
            },
            { status: 408 }
          )
        }
        
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "N8N_ERROR",
              message: "Failed to connect to n8n webhook",
              details: fetchError.message
            }
          },
          { status: 500 }
        )
      }
      
      // Handle unknown error types
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "N8N_ERROR",
            message: "Failed to connect to n8n webhook",
            details: String(fetchError)
          }
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in upload knowledge base by link API:', error)
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
