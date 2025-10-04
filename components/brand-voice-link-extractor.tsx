"use client"

import * as React from "react"
import { ExternalLink, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authService } from "@/lib/auth-service"

interface BrandVoicePattern {
  style: string
  confidence: number
  source: string
}

interface BrandVoiceLinkExtractorProps {
  onPatternsExtracted: (patterns: BrandVoicePattern[]) => void
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void
}

export function BrandVoiceLinkExtractor({ 
  onPatternsExtracted, 
  onShowToast
}: BrandVoiceLinkExtractorProps) {
  const [url, setUrl] = React.useState("")
  const [isExtracting, setIsExtracting] = React.useState(false)
  const [extractedPatterns, setExtractedPatterns] = React.useState<BrandVoicePattern[]>([])
  const [error, setError] = React.useState("")
  const [selectedPatterns, setSelectedPatterns] = React.useState<string[]>([])

  const getAccessToken = () => {
    const token = authService.getAuthToken()
    if (!token) {
      setError("Authentication required")
      return null
    }
    return token
  }

  const handleExtract = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setIsExtracting(true)
    setError("")
    setExtractedPatterns([])
    setSelectedPatterns([])

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
        setError(errorData.error?.message || `Failed to extract patterns (${response.status})`)
        return
      }

      const extractionResult = await response.json()
      console.log('📊 Extraction result:', extractionResult)

      if (!extractionResult.success) {
        console.log('❌ Pattern extraction failed:', extractionResult.error)
        setError(extractionResult.error?.message || "Failed to extract brand voice patterns")
        return
      }

      console.log('✅ Patterns extracted successfully')

      const patterns: BrandVoicePattern[] = extractionResult.data.patterns || []
      setExtractedPatterns(patterns)
      onPatternsExtracted(patterns)
      onShowToast(`Found ${patterns.length} communication patterns`, 'success')

      console.log('✅ Brand voice pattern extraction completed successfully')

    } catch (err) {
      console.error('❌ Error in pattern extraction process:', err)
      setError("Network error occurred while extracting patterns")
    } finally {
      setIsExtracting(false)
    }
  }

  const handlePatternSelect = (pattern: BrandVoicePattern) => {
    const patternKey = pattern.style
    if (selectedPatterns.includes(patternKey)) {
      setSelectedPatterns(prev => prev.filter(p => p !== patternKey))
    } else {
      setSelectedPatterns(prev => [...prev, patternKey])
    }
  }

  const handleApplySelected = () => {
    const newStyles = selectedPatterns.map(patternKey => 
      extractedPatterns.find(p => p.style === patternKey)?.style || patternKey
    )
    onPatternsExtracted(
      extractedPatterns.filter(p => selectedPatterns.includes(p.style))
    )
    onShowToast(`Applied ${selectedPatterns.length} patterns to communication style`, 'success')
    setSelectedPatterns([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isExtracting && url.trim()) {
      handleExtract()
    }
  }

  return (
    <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-slate-800 text-base font-semibold">
          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
            <Sparkles className="h-4 w-4 text-blue-600" />
          </div>
          Extract Communication Patterns
        </CardTitle>
        <CardDescription className="text-slate-600 text-sm">
          Insert links to extract communication patterns and tone of voice from content
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com/about, https://blog.example.com/posts..."
            className="flex-1"
            disabled={isExtracting}
          />
          <Button
            onClick={handleExtract}
            disabled={isExtracting || !url.trim()}
            size="sm"
            className="h-7 text-xs text-center bg-blue-600 hover:bg-blue-700"
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <ExternalLink className="h-3 w-3 mr-1" />
                Extract
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {extractedPatterns.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-800">
                  Detected Communication Patterns
                </h4>
                {selectedPatterns.length > 0 && (
                  <Button
                    onClick={handleApplySelected}
                    size="sm"
                    className="h-6 text-xs bg-blue-600 hover:bg-blue-700"
                  >
                    Apply Selected ({selectedPatterns.length})
                  </Button>
                )}
              </div>
            
            <div className="grid gap-2">
              {extractedPatterns.map((pattern, index) => (
                <div
                  key={index}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all
                    ${selectedPatterns.includes(pattern.style)
                      ? 'border-blue-500 bg-blue-50 shadow-sm'
                      : 'border-slate-200 hover:border-blue-300 bg-white'
                    }
                  `}
                  onClick={() => handlePatternSelect(pattern)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {pattern.style}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(pattern.confidence * 100)}% confidence
                        </Badge>
                        <span className="text-xs text-slate-600">
                          Source: {pattern.source}
                        </span>
                      </div>
                    </div>
                    <div className="ml-2">
                      {selectedPatterns.includes(pattern.style) && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {extractedPatterns.length > 0 && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-slate-200">
            ✅ Successfully extracted {extractedPatterns.length} patterns from {url}
          </div>
        )}
      </CardContent>
    </Card>
  )
}