// Brand Pattern Extraction Service
// Handles extraction of communication patterns and brand voice from web content

import { API_ENDPOINTS } from '@/lib/api-config'

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
      type?: string
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
        // Check if this is a YouTube URL
        const isYouTubeUrl = this.isYouTubeUrl(request.url)
        
        if (isYouTubeUrl) {
          console.log('📺 Detected YouTube URL, extracting subtitles for tone analysis')
          // Extract subtitles for YouTube videos using the subtitle webhook
          const patterns = await this.extractYouTubeTonePatterns(request.url, request.accessToken)
          
          return {
            success: true,
            data: {
              patterns: patterns,
              content: `YouTube video subtitle analysis`,
              metadata: {
                source_url: request.url,
                extracted_at: new Date().toISOString(),
                content_length: 0,
                type: 'youtube_subtitle'
              }
            },
            message: `Successfully extracted ${patterns.length} tone patterns from YouTube video`
          }
        }

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
          
          // Handle specific credit error from scraping
          if (scrapeData.error?.message === "Don't have enough credit") {
            return {
              success: false,
              error: {
                code: "CREDIT_ERROR",
                message: "Don't have enough credit"
              }
            }
          }
          
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
                message: "Request timed. out while extracting patterns"
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

  // YouTube URL detection helper
  private static isYouTubeUrl(url: string): boolean {
    // Enhanced YouTube regex to handle all YouTube URL formats
    const patterns = [
      /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/[^\/\?&]+/,  // shorts URLs
      /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[^&]+/,     // watch URLs
      /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[^\/\?&]+/,   // embed URLs
      /^https?:\/\/(?:www\.)?youtube\.com\/v\/[^\/\?&]+/,       // direct v URLs
      /^https?:\/\/youtu\.be\/[^\/\?&]+/,                      // youtu.be URLs
      /^https?:\/\/(?:www\.)?youtube\.com\/\w+\/.*?\/[^\/\?&]+/, // playlist/channel URLs
    ]
    
    const isYouTube = patterns.some(pattern => pattern.test(url))
    console.log('🔍 YouTube URL check:', { url, isYouTube })
    return isYouTube
  }

  // Extract YouTube subtitle patterns for tone analysis
  private static async extractYouTubeTonePatterns(url: string, accessToken: string): Promise<BrandVoicePattern[]> {
    try {
      console.log('🔍 Calling YouTube subtitle webhook for:', url)
      console.log('🔑 Access token length:', accessToken?.length || 'undefined')
      console.log('🔑 Access token preview:', accessToken ? `${accessToken.substring(0, 20)}...` : 'undefined')
      console.log('🌐 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.YOUTUBE_SUBTITLE)
      
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 30000)
      
      // Try POST first (standard approach)
      const requestBody = {
        url: url,
        access_token: accessToken
      }
      console.log('📤 POST Request body:', requestBody)
      
      let response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.YOUTUBE_SUBTITLE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      })
      
      let responseMethod = 'POST'
      
      // If POST fails with 404, try GET with query parameters
      if (!response.ok && response.status === 404) {
        console.log('🔄 POST failed with 404, trying GET method...')
        const getUrl = new URL(API_ENDPOINTS.N8N_WEBHOOKS.YOUTUBE_SUBTITLE)
        getUrl.searchParams.set('url', url)
        getUrl.searchParams.set('access_token', accessToken)
        console.log('📤 GET Request URL:', getUrl.toString())
        
        response = await fetch(getUrl.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          signal: controller.signal
        })
        responseMethod = 'GET'
      }

      console.log(`📊 Webhook response status: ${response.status} (method: ${responseMethod})`)
      console.log('📊 Webhook response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        console.error('❌ YouTube subtitle webhook failed:', response.status)
        try {
          const errorText = await response.text()
          console.error('❌ Error response body:', errorText)
        } catch (e) {
          console.error('❌ Could not read error response body')
        }
        // Fall back to basic patterns
        return this.getDefaultYouTubeTonePatterns()
      }

      const subtitleData = await response.json()
      console.log('✅ YouTube subtitle data received:', subtitleData)
      
      // Parse the actual response structure from your n8n webhook
      if (Array.isArray(subtitleData) && subtitleData.length > 0) {
        const responseItem = subtitleData[0]
        if (responseItem.transcript && responseItem.tone) {
          console.log('🎭 Processing transcript and tone analysis...')
          
          // Return the tone analysis text directly as a single pattern
          return [{
            style: responseItem.tone,
            confidence: 0.95,
            source: 'YouTube Video Analysis',
            examples: ['tone analysis from video']
          }]
        }
      }
      
      // Alternative parsing for different response structure
      if (subtitleData.success && subtitleData.data?.subtitles) {
        const patterns = this.analyzeSubtitleTone(subtitleData.data.subtitles)
        return patterns.length > 0 ? patterns : this.getDefaultYouTubeTonePatterns()
      }
      
      return this.getDefaultYouTubeTonePatterns()
      
    } catch (error) {
      console.error('❌ Error extracting YouTube tone patterns:', error)
      return this.getDefaultYouTubeTonePatterns()
    }
  }

  // Analyze subtitle content for tone patterns
  private static analyzeSubtitleTone(subtitles: string): BrandVoicePattern[] {
    const patterns: BrandVoicePattern[] = []
    const normalizedText = subtitles.toLowerCase()

    // Enhanced tone detection patterns specifically for video content
    const youtubeToneRules = [
      {
        keywords: ['exciting', 'amazing', 'incredible', 'fantastic', 'awesome'],
        style: 'Enthusiastic and Exciting',
        examples: ['guys!', 'amazing', 'incredible', 'mind-blowing']
      },
      {
        keywords: ['tutorial', 'step', 'how to', 'guide', 'learn'],
        style: 'Educational and Helpful',
        examples: ['tutorial', 'step-by-step', 'how-to', 'guide']
      },
      {
        keywords: ['fun', 'entertaining', 'hilarious', 'comedy', 'joke'],
        style: 'Fun and Entertaining',
        examples: ['fun', 'hilarious', 'comedy', 'jokes']
      },
      {
        keywords: ['professional', 'business', 'corporate', 'expert'],
        style: 'Professional and Authoritative',
        examples: ['professional', 'expert', 'business', 'corporate']
      },
      {
        keywords: ['personal', 'story', 'experience', 'honest'],
        style: 'Personal and Authentic',
        examples: ['my story', 'personal', 'experience', 'honestly']
      },
      {
        keywords: ['informative', 'knowledge', 'insight', 'analysis'],
        style: 'Informative and Analytical',
        examples: ['insight', 'analysis', 'knowledge', 'informative']
      }
    ]

    // Analyze subtitles for tone patterns
    youtubeToneRules.forEach(rule => {
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
          source: 'YouTube Video',
          examples: [...matchedKeywords, ...matchedExamples]
        })
      }
    })

    // Sort by confidence and return top patterns
    return patterns
      .sort((a, b) => b.confidence - a.confidence)
      .filter(pattern => pattern.confidence > 0.3)
      .slice(0, 4) // Top 4 patterns for YouTube
  }

  // Extract patterns from the AI-generated tone analysis text
  private static extractPatternsFromToneAnalysis(toneText: string): BrandVoicePattern[] {
    const patterns: BrandVoicePattern[] = []
    const normalizedText = toneText.toLowerCase()

    // Map tone analysis keywords to communication style types
    const tonePatternMapping = [
      {
        keywords: ['high energy', 'elevated', 'performance-driven', 'enthusiastic', 'vibrant'],
        style: 'High Energy and Enthusiastic',
        confidence: 0.9
      },
      {
        keywords: ['confident', 'authority', 'commands', 'composure', 'authoritative'],
        style: 'Confident and Authoritative',
        confidence: 0.9
      },
      {
        keywords: ['theatrical', 'mystical', 'wonder', 'showmanship', 'spectacle'],
        style: 'Theatrical and Entertaining',
        confidence: 0.9
      },
      {
        keywords: ['conversational', 'intimate', 'direct communication', 'personal connections'],
        style: 'Conversational and Approachable',
        confidence: 0.8
      },
      {
        keywords: ['deliberate', 'strategic', 'varied pace', 'orchestrates'],
        style: 'Strategic and Deliberate',
        confidence: 0.8
      },
      {
        keywords: ['dramatic', 'suspense', 'anticipation', 'performance'],
        style: 'Dramatic and Engaging',
        confidence: 0.8
      }
    ]

    // Check for tone pattern matches
    tonePatternMapping.forEach(mapping => {
      const matchedKeywords = mapping.keywords.filter(keyword => 
        normalizedText.includes(keyword.toLowerCase())
      )
      
      if (matchedKeywords.length > 0) {
        patterns.push({
          style: mapping.style,
          confidence: mapping.confidence,
          source: 'AI Tone Analysis',
          examples: matchedKeywords
        })
      }
    })

    return patterns
  }

  // Remove duplicate patterns based on style
  private static removeDuplicatePatterns(patterns: BrandVoicePattern[]): BrandVoicePattern[] {
    const seen = new Set<string>()
    return patterns.filter(pattern => {
      if (seen.has(pattern.style)) {
        return false
      }
      seen.add(pattern.style)
      return true
    })
  }

  // Default patterns to return when YouTube analysis fails
  private static getDefaultYouTubeTonePatterns(): BrandVoicePattern[] {
    return [
      {
        style: 'Engaging Content Creator',
        confidence: 0.8,
        source: 'YouTube Default Analysis',
        examples: ['video content', 'content creator', 'engagement']
      },
      {
        style: 'Informative Presenter',
        confidence: 0.6,
        source: 'YouTube Default Analysis', 
        examples: ['information sharing', 'educational', 'presentation']
      }
    ]
  }
}