// Webhook Service
// Handles communication with n8n webhooks

import { API_ENDPOINTS } from '../api-config'

export interface WebhookResponse<T = any> {
  success: boolean
  status: number
  statusText: string
  data: T
  headers: Record<string, string>
  webhook_url: string
}

export class WebhookService {
  /**
   * Test knowledge base webhook and get data
   */
  static async testKnowledgeBaseWebhook(accessToken: string): Promise<WebhookResponse> {
    try {
      console.log('🧪 Testing knowledge base webhook...')
      
      const response = await fetch('/api/test-knowledge-base-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          access_token: accessToken
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API route error: ${response.status} - ${errorText}`)
      }

      const result = await response.json()
      console.log('✅ Webhook test successful:', result)
      
      return result

    } catch (error: any) {
      console.error('❌ Error testing webhook:', error)
      throw new Error(`Failed to test webhook: ${error.message}`)
    }
  }

  /**
   * Test basic connectivity to webhook
   */
  static async testWebhookConnectivity(): Promise<{ status: number; ok: boolean }> {
    try {
      console.log('🌐 Testing webhook connectivity...')
      
      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_KNOWLEDGE_BASE_IN_FIELD, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      console.log('📊 Connectivity test result:', { status: response.status, ok: response.ok })
      
      return {
        status: response.status,
        ok: response.ok
      }

    } catch (error: any) {
      console.error('❌ Connectivity test failed:', error)
      throw new Error(`Connectivity test failed: ${error.message}`)
    }
  }
}
