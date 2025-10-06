// Knowledge Base Population Hook
// Handles loading and populating knowledge base data

import { useState } from 'react'
import { authService } from '@/lib/auth-service'
import { WebhookService } from '@/lib/services/webhook-service'
import { KnowledgeBaseWebhookParser, ParsedKnowledgeBaseData } from '@/lib/services/knowledge-base-webhook-parser'

export interface UseKnowledgeBasePopulationReturn {
  isLoading: boolean
  isTestingConnectivity: boolean
  loadKnowledgeBase: () => Promise<void>
  testConnectivity: () => Promise<void>
  error: string | null
}

export function useKnowledgeBasePopulation(
  onPopulateData?: (data: ParsedKnowledgeBaseData) => void
): UseKnowledgeBasePopulationReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [isTestingConnectivity, setIsTestingConnectivity] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadKnowledgeBase = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        throw new Error('No access token found. Please log in first.')
      }

      console.log('🔄 Loading knowledge base data...')
      
      // Test webhook and get data
      const webhookResponse = await WebhookService.testKnowledgeBaseWebhook(accessToken)
      
      if (!webhookResponse.success || !webhookResponse.data) {
        throw new Error('No data received from webhook')
      }

      // Parse the data
      console.log('📝 Parsing webhook data...')
      const parsedData = KnowledgeBaseWebhookParser.parseWebhookData(webhookResponse.data)
      
      // Populate the form
      if (onPopulateData) {
        onPopulateData(parsedData)
        console.log('✅ Knowledge base data populated successfully')
      }

    } catch (err: any) {
      console.error('❌ Error loading knowledge base:', err)
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const testConnectivity = async () => {
    setIsTestingConnectivity(true)
    setError(null)
    
    try {
      console.log('🌐 Testing webhook connectivity...')
      
      const result = await WebhookService.testWebhookConnectivity()
      
      console.log('📊 Connectivity test result:', result)
      
    } catch (err: any) {
      console.error('❌ Connectivity test failed:', err)
      setError(err.message)
      throw err
    } finally {
      setIsTestingConnectivity(false)
    }
  }

  return {
    isLoading,
    isTestingConnectivity,
    loadKnowledgeBase,
    testConnectivity,
    error
  }
}
