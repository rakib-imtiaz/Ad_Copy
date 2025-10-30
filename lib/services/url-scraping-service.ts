// URL Scraping Service
// Handles all webhook communication for URL scraping

import { API_ENDPOINTS } from '@/lib/api-config'

export interface ScrapingRequest {
  url: string
  accessToken: string
}

export interface ScrapingResponse {
  success: boolean
  data?: any
  message?: string
  error?: {
    code: string
    message: string
    details?: string
  }
}

export class URLScrapingService {
  private static readonly TIMEOUT = 120000 // 2 minutes

  static async scrapeURL(request: ScrapingRequest): Promise<ScrapingResponse> {
    try {
      console.log('🔗 Starting URL scraping for:', request.url)
      
      const webhookUrl = API_ENDPOINTS.N8N_WEBHOOKS.UPLOAD_KNOWLEDGE_BASE_BY_LINK
      
      const requestBody = JSON.stringify({
        access_token: request.accessToken,
        url: request.url
      })

      const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${request.accessToken}`,
      }

      console.log('📤 Sending request to webhook:', {
        url: webhookUrl,
        data_size: requestBody.length,
        target_url: request.url
      })

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: requestBody,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.log('📊 Webhook response status:', response.status)

        const responseText = await response.text()

        if (!response.ok) {
          console.error('❌ Webhook failed:', response.status, responseText)
          return {
            success: false,
            error: {
              code: "WEBHOOK_ERROR",
              message: `Webhook failed with status ${response.status}`,
              details: responseText
            }
          }
        }

        // Check for credit error in response text
        if (responseText.includes("Don't have enough credit")) {
          console.log('❌ Credit limit reached in webhook response')
          return {
            success: false,
            error: {
              code: "CREDIT_ERROR",
              message: "Don't have enough credit"
            }
          }
        }

        // Parse response
        let data
        try {
          if (responseText.trim()) {
            data = JSON.parse(responseText)
            console.log('✅ Webhook response parsed successfully')
            console.log('📊 Parsed data structure:', {
              isArray: Array.isArray(data),
              hasText: data?.text ? 'Yes' : 'No',
              isArrayWithText: Array.isArray(data) && data[0]?.text ? 'Yes' : 'No',
              dataLength: responseText.length,
              firstChars: responseText.substring(0, 200) + '...'
            })
          } else {
            data = { success: true, message: 'URL scraped successfully' }
          }
        } catch (e) {
          console.log('⚠️ Response not JSON, treating as text')
          data = { 
            success: true, 
            message: responseText || 'URL scraped successfully',
            content: responseText
          }
        }

        return {
          success: true,
          data: data,
          message: 'URL scraped successfully'
        }

      } catch (fetchError) {
        clearTimeout(timeoutId)
        console.error('❌ Network error:', fetchError)
        
        if (fetchError instanceof Error) {
          if (fetchError.name === 'AbortError') {
            return {
              success: false,
              error: {
                code: "TIMEOUT_ERROR",
                message: "Request timed out"
              }
            }
          }
          
          return {
            success: false,
            error: {
              code: "NETWORK_ERROR",
              message: "Failed to connect to webhook",
              details: fetchError.message
            }
          }
        }

        return {
          success: false,
          error: {
            code: "UNKNOWN_ERROR",
            message: "An unknown error occurred"
          }
        }
      }

    } catch (error) {
      console.error('❌ Service error:', error)
      return {
        success: false,
        error: {
          code: "SERVICE_ERROR",
          message: "An unexpected error occurred"
        }
      }
    }
  }
}
