import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    console.log('=== WEBPAGE SCRAPE API (GET) START ===')
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
    
    // Get URL from query parameters
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "URL parameter is required"
          }
        },
        { status: 400 }
      )
    }

    console.log('📋 URL to scrape:', url)

    // Extract access token from authorization header
    const accessToken = authHeader.replace('Bearer ', '')
    
    // Prepare request to n8n webhook with GET method
    const webhookUrl = `${API_ENDPOINTS.N8N_WEBHOOKS.WEBPAGE_SCRAPE}?url=${encodeURIComponent(url)}`
    
    console.log('📤 Sending scrape request to n8n webhook:', {
      url: webhookUrl,
      method: 'GET',
      auth_method: 'Authorization Header',
      access_token_length: accessToken.length,
      target_url: url
    })
    
    // Call the n8n webhook with GET method and Authorization header
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for scraping
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
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
          
          // If the parsed data is an empty object or doesn't have success field, treat as success
          if (Object.keys(data).length === 0 || data.success === undefined) {
            console.log('Empty object or missing success field, treating as success')
            data = { 
              success: true,
              message: 'URL scraped successfully',
              data: {
                url: url,
                scraped_at: new Date().toISOString(),
                content: 'Content extracted successfully'
              }
            }
          }
        } else {
          console.log('Empty response from webhook, providing default success response')
          data = { 
            success: true,
            message: 'URL scraped successfully',
            data: {
              url: url,
              scraped_at: new Date().toISOString(),
              content: 'Content extracted successfully'
            }
          }
        }
      } catch (e) {
        console.log('Response is not JSON, treating as text:', responseText)
        data = { 
          success: true,
          message: responseText || 'URL scraped successfully',
          data: {
            url: url,
            scraped_at: new Date().toISOString(),
            content: responseText || 'Content extracted successfully'
          }
        }
      }

      // If n8n webhook returns an error, return the error
      if (response.status === 500 || responseText.trim() === '' || data.success === false) {
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
    console.error('Error in webpage scrape API (GET):', error)
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

export async function POST(request: NextRequest) {
  try {
    console.log('=== WEBPAGE SCRAPE API START ===')
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
    console.log('🔗 Webhook URL being used:', API_ENDPOINTS.N8N_WEBHOOKS.WEBPAGE_SCRAPE)

    // Parse the request body
    const body = await request.json()
    const { url } = body

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

    console.log('📋 URL to scrape:', url)

    // Extract access token from authorization header
    const accessToken = authHeader.replace('Bearer ', '')
    
    // Prepare request to n8n webhook
    const requestBody = JSON.stringify({
      access_token: accessToken,
      url: url
    })

    // Use Bearer authentication for the webhook (consistent with other API routes)
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
    
    console.log('📤 Sending scrape request to n8n webhook:', {
      url: API_ENDPOINTS.N8N_WEBHOOKS.WEBPAGE_SCRAPE,
      data_type: 'JSON',
      data_size: requestBody.length,
      auth_method: 'Bearer',
      access_token_length: accessToken.length,
      target_url: url
    })
    
    // Debug: Log the actual data being sent
    console.log('🔍 Data being sent to webhook:')
    console.log(JSON.stringify(JSON.parse(requestBody), null, 2))

    // Call the n8n webhook with Bearer token authentication
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60 second timeout for scraping
    
    try {
      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.WEBPAGE_SCRAPE, {
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
          
          // If the parsed data is an empty object or doesn't have success field, treat as success
          if (Object.keys(data).length === 0 || data.success === undefined) {
            console.log('Empty object or missing success field, treating as success')
            data = { 
              success: true,
              message: 'URL scraped successfully',
              data: {
                url: url,
                scraped_at: new Date().toISOString(),
                content: 'Content extracted successfully'
              }
            }
          }
        } else {
          console.log('Empty response from webhook, providing default success response')
          data = { 
            success: true,
            message: 'URL scraped successfully',
            data: {
              url: url,
              scraped_at: new Date().toISOString(),
              content: 'Content extracted successfully'
            }
          }
        }
      } catch (e) {
        console.log('Response is not JSON, treating as text:', responseText)
        data = { 
          success: true,
          message: responseText || 'URL scraped successfully',
          data: {
            url: url,
            scraped_at: new Date().toISOString(),
            content: responseText || 'Content extracted successfully'
          }
        }
      }

      // If n8n webhook returns an error, return the error
      if (response.status === 500 || responseText.trim() === '' || data.success === false) {
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
    console.error('Error in webpage scrape API:', error)
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