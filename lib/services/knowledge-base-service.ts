// Knowledge Base Service
// Handles fetching and populating knowledge base data

import { authService } from "../auth-service"
import { API_ENDPOINTS } from "../api-config"
import { KnowledgeBaseParser, ParsedKnowledgeBaseData } from "../utils/knowledge-base-parser"

export class KnowledgeBaseService {
  /**
   * Fetch raw knowledge base content from the API
   */
  static async fetchKnowledgeBaseContent(): Promise<string | null> {
    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        console.error('No access token found')
        return null
      }

      console.log('📡 Fetching knowledge base content from API...')
      
      const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.SEE_KNOWLEDGE_BASE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        console.error('Failed to fetch knowledge base content:', response.status)
        return null
      }

      const result = await response.json()
      
      // Handle different response formats
      let contentText = ""
      
      if (Array.isArray(result) && result.length > 0) {
        contentText = result[0]?.company_info || result[0]?.business_info || ""
      } else if (result && typeof result === 'object') {
        contentText = result.company_info || result.business_info || result.data?.company_info || result.data?.business_info || result.data || ""
      } else if (typeof result === 'string') {
        contentText = result
      }

      console.log('✅ Knowledge base content fetched successfully, length:', contentText.length)
      return contentText

    } catch (error) {
      console.error('Error fetching knowledge base content:', error)
      return null
    }
  }

  /**
   * Get parsed knowledge base data ready for form population
   */
  static async getParsedKnowledgeBaseData(): Promise<ParsedKnowledgeBaseData | null> {
    try {
      const content = await this.fetchKnowledgeBaseContent()
      
      if (!content) {
        console.log('No knowledge base content found')
        return null
      }

      console.log('📝 Parsing knowledge base content into structured data...')
      const parsedData = KnowledgeBaseParser.parseContent(content)
      
      console.log('✅ Knowledge base data parsed successfully')
      return parsedData

    } catch (error) {
      console.error('Error parsing knowledge base data:', error)
      return null
    }
  }

  /**
   * Trigger form population with knowledge base data
   */
  static async populateFormWithKnowledgeBase(): Promise<boolean> {
    try {
      const parsedData = await this.getParsedKnowledgeBaseData()
      
      if (!parsedData) {
        console.log('No data available to populate form')
        return false
      }

      // Access form population function via global reference
      if ((window as any).brandFormPopulation) {
        (window as any).brandFormPopulation.populateFormWithData(parsedData)
        return true
      } else {
        console.error('Form population function not available')
        return false
      }

    } catch (error) {
      console.error('Error populating form with knowledge base data:', error)
      return false
    }
  }
}
