// Brand Pattern Extraction Service
// Handles extraction of communication patterns and brand voice from web content

export interface BrandPatternExtractionRequest {
  url: string
  accessToken: string
}

export interface BrandPatternExtractionResponse {
  success: boolean
  data?: {
    patterns: BrandVoicePattern[]
    content: string
    metadata: {
      source_url: string
      extracted_at: string
      content_length: number
    }
  }
  message?: string
  error?: {
    code: string
    message: string
    details?: string
  }
}

export interface BrandVoicePattern {
  style: string
  confidence: number
  source: string
  examples: string[]
}

export class BrandPatternExtractionService {
  private static readonly TIMEOUT = 60000 // 1 minute

  static async extractPatterns(request: BrandPatternExtractionRequest): Promise<BrandPatternExtractionResponse> {
    try {
      console.log('🎯 Starting brand pattern extraction for:', request.url)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT)

      try {
        // First, we need to scrape the content from the URL
        // Note: Authentication should be handled by the calling API route
        const scrapeResponse = await fetch('/api/scrape-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: request.url,
            access_token: request.accessToken
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        console.log('📊 Scrape response status:', scrapeResponse.status)

        const scrapeData = await scrapeResponse.json()

        if (!scrapeResponse.ok || !scrapeData.success) {
          console.error('❌ Scraping failed:', scrapeData.error)
          return {
            success: false,
            error: {
              code: "SCRAPING_ERROR",
              message: "Failed to scrape content from URL",
              details: scrapeData.error?.message || "Unknown scraping error"
            }
          }
        }

        // Now analyze the scraped content to extract brand voice patterns
        const patterns = await this.analyzeBrandPatterns(scrapeData.data)

        return {
          success: true,
          data: {
            patterns: patterns,
            content: this.extractReadableContent(scrapeData.data),
            metadata: {
              source_url: request.url,
              extracted_at: new Date().toISOString(),
              content_length: this.extractReadableContent(scrapeData.data).length
            }
          },
          message: `Successfully extracted ${patterns.length} communication patterns`
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
                message: "Request timed out while extracting patterns"
              }
            }
          }
          
          return {
            success: false,
            error: {
              code: "NETWORK_ERROR",
              message: "Failed to extract patterns",
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
          message: "An unexpected error occurred during pattern extraction"
        }
      }
    }
  }

  private static async analyzeBrandPatterns(content: any): Promise<BrandVoicePattern[]> {
    try {
      // Extract text content from the scraped data
      const textContent = this.extractTextContent(content)
      
      // Here we would typically send this to an AI service for pattern analysis
      // For now, we'll implement a basic pattern detection logic
      const patterns = this.detectBasicPatterns(textContent)
      
      return patterns
    } catch (error) {
      console.error('❌ Error analyzing brand patterns:', error)
      return []
    }
  }

  private static extractTextContent(content: any): string {
    if (typeof content === 'string') {
      return content
    }
    
    if (typeof content === 'object') {
      // Handle different content structures
      if (Array.isArray(content)) {
        return content.map(item => this.extractTextContent(item)).join(' ')
      }
      
      if (content.text) {
        return content.text
      }
      
      if (content.content) {
        return content.content
      }
      
      // Extract all string values from the object
      return Object.values(content)
        .filter(value => typeof value === 'string')
        .join(' ')
    }
    
    return String(content)
  }

  private static detectBasicPatterns(text: string): BrandVoicePattern[] {
    const patterns: BrandVoicePattern[] = []
    const normalizedText = text.toLowerCase()

    // Define pattern detection rules
    const patternRules = [
      {
        keywords: ['professional', 'corporate', 'business', 'formal', 'serious'],
        style: 'Professional and Formal',
        examples: ['meeting', 'client', 'business', 'corporate']
      },
      {
        keywords: ['friendly', 'warm', 'welcoming', 'hospitable', 'kind'],
        style: 'Friendly and Warm',
        examples: ['welcome', 'hello', 'help', 'support', 'care']
      },
      {
        keywords: ['innovative', 'cutting-edge', 'modern', 'revolutionary', 'advanced'],
        style: 'Innovative and Modern',
        examples: ['innovation', 'technology', 'future', 'breakthrough', 'next-gen']
      },
      {
        keywords: ['authentic', 'genuine', 'honest', 'transparent', 'real'],
        style: 'Authentic and Genuine',
        examples: ['authentic', 'honest', 'transparent', 'real', 'genuine']
      },
      {
        keywords: ['energetic', 'dynamic', 'enthusiastic', 'exciting', 'vibrant'],
        style: 'Energetic and Dynamic',
        examples: ['exciting', 'dynamic', 'energetic', 'vibrant', 'enthusiastic']
      },
      {
        keywords: ['luxury', 'premium', 'exclusive', 'sophisticated', 'elegant'],
        style: 'Luxury and Sophisticated',
        examples: ['luxury', 'premium', 'exclusive', 'sophisticated', 'elegant']
      }
    ]

    // Analyze text for pattern matching
    patternRules.forEach(rule => {
      let confidence = 0
      const matchedKeywords = rule.keywords.filter(keyword => 
        normalizedText.includes(keyword.toLowerCase())
      )
      
      if (matchedKeywords.length > 0) {
        confidence = Math.min(matchedKeywords.length / rule.keywords.length, 1)
        
        // Look for example phrases
        const matchedExamples = rule.examples.filter(example =>
          normalizedText.includes(example.toLowerCase())
        )
        
        // Increase confidence if examples are found
        if (matchedExamples.length > 0) {
          confidence += 0.2
          confidence = Math.min(confidence, 1)
        }

        patterns.push({
          style: rule.style,
          confidence: confidence,
          source: rule.style,
          examples: [...matchedKeywords, ...matchedExamples]
        })
      }
    })

    // Sort by confidence and return top patterns
    return patterns
      .sort((a, b) => b.confidence - a.confidence)
      .filter(pattern => pattern.confidence > 0.3) // Only high-confidence patterns
      .slice(0, 5) // Limit to top 5 patterns
  }

  private static extractReadableContent(content: any): string {
    if (typeof content === 'string') {
      return content.substring(0, 500) + '...'
    }
    
    if (typeof content === 'object') {
      return JSON.stringify(content).substring(0, 500) + '...'
    }
    
    return String(content).substring(0, 500) + '...'
  }
}
