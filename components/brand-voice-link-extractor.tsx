"use client"

import * as React from "react"
import { ExternalLink, Loader2, Sparkles, AlertCircle, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"
import { toast } from "sonner"

interface BrandVoicePattern {
  style: string
  confidence: number
  source: string
  examples: string[]
}

interface BrandVoiceLinkExtractorProps {
  isExtracting?: boolean
  setIsExtracting?: (extracting: boolean) => void
  extractionError?: string | null
  setExtractionError?: (error: string | null) => void
  onPatternsExtracted: (patterns: BrandVoicePattern[]) => void
}

export function BrandVoiceLinkExtractor({ 
  isExtracting = false,
  setIsExtracting,
  extractionError = null,
  setExtractionError,
  onPatternsExtracted
}: BrandVoiceLinkExtractorProps) {
  const [url, setUrl] = React.useState("")
  const [extractedPatterns, setExtractedPatterns] = React.useState<BrandVoicePattern[]>([])
  
  // Use props for extraction state if provided, otherwise use local state
  const isCurrentlyExtracting = setIsExtracting ? isExtracting : false
  const currentError = setExtractionError ? extractionError : null
  
  const setCurrentlyExtracting = setIsExtracting || (() => {})
  const setCurrentError = setExtractionError || (() => {})
  
  // Check if the current URL is a YouTube URL
  const isYouTubeUrl = React.useMemo(() => {
    const youtubeRegex = /^((?:https?:)?\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)?\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    return youtubeRegex.test(url)
  }, [url])

  const getAccessToken = () => {
    const token = authService.getAuthToken()
    if (!token) {
      setCurrentError("Authentication required")
      return null
    }
    return token
  }

  const handleExtract = async () => {
    if (!url.trim()) {
      setCurrentError("Please enter a valid URL")
      return
    }

    setCurrentlyExtracting(true)
    setCurrentError("")
    setExtractedPatterns([])

    try {
      console.log('🚀 Starting brand voice pattern extraction...')
      console.log('📋 URL:', url.trim())

      const response = await fetch('/api/extract-brand-patterns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          url: url.trim()
        }),
      })

      console.log('📊 API response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('❌ API error:', errorData)
        setCurrentError(errorData.error?.message || `Failed to extract patterns (${response.status})`)
        return
      }

      const extractionResult = await response.json()
      console.log('📊 Extraction result:', extractionResult)

      if (!extractionResult.success) {
        console.log('❌ Pattern extraction failed:', extractionResult.error)
        setCurrentError(extractionResult.error?.message || "Failed to extract brand voice patterns")
        return
      }

      console.log('✅ Patterns extracted successfully')

      const patterns: BrandVoicePattern[] = extractionResult.data.patterns || []
      setExtractedPatterns(patterns)
      onPatternsExtracted(patterns)
      
      if (isYouTubeUrl) {
        toast.success(`Found ${patterns.length} tone patterns from YouTube video`)
      } else {
        toast.success(`Found ${patterns.length} communication patterns`)
      }

      console.log('✅ Brand voice pattern extraction completed successfully')

    } catch (err) {
      console.error('❌ Error in pattern extraction process:', err)
      setCurrentError("Network error occurred while extracting patterns")
    } finally {
      setCurrentlyExtracting(false)
    }
  }


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isCurrentlyExtracting && url.trim()) {
      handleExtract()
    }
  }

  return (
    <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-slate-800 text-base font-semibold">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
            {isYouTubeUrl ? (
              <Play className="h-4 w-4 text-red-600" />
            ) : (
              <Sparkles className="h-4 w-4 text-blue-600" />
            )}
          </div>
          {isYouTubeUrl ? 'Extract Communication Patterns from YouTube Video' : 'Extract Communication Patterns'}
        </CardTitle>
        <CardDescription className="text-slate-600 text-sm">
          {isYouTubeUrl 
            ? 'Analyze YouTube video subtitles to extract communication tone and voice patterns'
            : 'Insert links to extract communication patterns and tone of voice from content'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isYouTubeUrl ? "https://youtube.com/watch?v=..." : "https://example.com/about, https://blog.example.com/posts..."}
            className="flex-1"
            disabled={isCurrentlyExtracting}
          />
          <Button
            onClick={handleExtract}
            disabled={isCurrentlyExtracting || !url.trim()}
            size="sm"
            className={`h-7 text-xs text-center ${
              isYouTubeUrl 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isCurrentlyExtracting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                {isYouTubeUrl ? 'Analyzing Video...' : 'Extracting...'}
              </>
            ) : (
              <>
                {isYouTubeUrl ? (
                  <Play className="h-3 w-3 mr-1" />
                ) : (
                  <ExternalLink className="h-3 w-3 mr-1" />
                )}
                {isYouTubeUrl ? 'Analyze Video' : 'Extract'}
              </>
            )}
          </Button>
        </div>
        
        {currentError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{currentError}</AlertDescription>
          </Alert>
        )}
        
        
        {extractedPatterns.length > 0 && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-slate-200">
            ✅ {isYouTubeUrl 
              ? `Successfully analyzed ${extractedPatterns.length} tone patterns from YouTube video`
              : `Successfully extracted ${extractedPatterns.length} patterns from ${url}`
            }
          </div>
        )}
      </CardContent>
    </Card>
  )
}