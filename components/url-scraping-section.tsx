"use client"

import * as React from "react"
import { Link, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataParser } from "@/lib/utils/data-parser"
import { FormAutoFillService } from "@/lib/services/form-auto-fill-service"
import { authService } from "@/lib/auth-service"

interface URLScrapingSectionProps {
  onDataScraped: (data: any) => void
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void
  formData: any
  updateNestedField: (path: string[], value: any) => void
  updateField: (field: string, value: string) => void
}

export function URLScrapingSection({ 
  onDataScraped, 
  onShowToast, 
  formData,
  updateNestedField,
  updateField
}: URLScrapingSectionProps) {
  const [url, setUrl] = React.useState("")
  const [isScraping, setIsScraping] = React.useState(false)
  const [scrapedData, setScrapedData] = React.useState<any>(null)
  const [error, setError] = React.useState("")

  const handleScrape = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL")
      return
    }

    setIsScraping(true)
    setError("")
    setScrapedData(null)

    try {
      const accessToken = authService.getAuthToken()
      if (!accessToken) {
        setError("Authentication required")
        return
      }

      console.log('🚀 Starting URL scraping process...')
      console.log('📋 URL:', url.trim())
      console.log('📋 Access token available:', accessToken ? 'Yes' : 'No')

      // Step 1: Call our API route which handles the webhook
      console.log('📡 Making API call to /api/scrape-url')
      const response = await fetch('/api/scrape-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          access_token: accessToken,
          url: url.trim()
        }),
      })

      console.log('📊 API response status:', response.status)
      console.log('📊 API response ok:', response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.log('❌ API error:', errorData)
        setError(errorData.error?.message || `Failed to scrape URL (${response.status})`)
        return
      }

      const scrapingResult = await response.json()
      console.log('📊 Scraping result:', scrapingResult)

      if (!scrapingResult.success) {
        console.log('❌ Scraping failed:', scrapingResult.error)
        setError(scrapingResult.error?.message || "Failed to scrape URL")
        return
      }

      console.log('✅ URL scraped successfully, parsing data...')

      // Step 2: Parse the scraped data
      const parsedData = DataParser.parseScrapedData(scrapingResult.data)
      
      console.log('✅ Data parsed successfully, auto-filling form...')

      // Step 3: Auto-fill the form
      const autoFillResult = FormAutoFillService.autoFillForm(
        formData,
        parsedData,
        updateNestedField,
        updateField
      )

      // Step 4: Update UI and notify parent
      setScrapedData(scrapingResult.data)
      onDataScraped(scrapingResult.data)
      onShowToast(autoFillResult.message, autoFillResult.success ? 'success' : 'info')

      console.log('✅ URL scraping process completed successfully')

    } catch (err) {
      console.error('❌ Error in URL scraping process:', err)
      setError("Network error occurred while scraping URL")
    } finally {
      setIsScraping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isScraping && url.trim()) {
      handleScrape()
    }
  }

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-blue-800 text-base font-semibold">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Link className="h-4 w-4" />
          </div>
          Extract Information from Web
        </CardTitle>
        <CardDescription className="text-blue-600 text-sm">
          Enter a website URL to automatically extract and fill your Business Info
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="https://example.com"
            className="flex-1"
            disabled={isScraping}
          />
          <Button
            onClick={handleScrape}
            disabled={isScraping || !url.trim()}
            size="sm"
            className="h-7 text-xs text-center bg-blue-600 hover:bg-blue-700"
          >
            {isScraping ? (
              <>
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Link className="h-3 w-3 mr-1" />
                Scrape
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-200">
            {error}
          </div>
        )}
        
        {scrapedData && (
          <div className="text-green-600 text-sm bg-green-50 p-2 rounded border border-green-200">
            ✅ Successfully scraped and auto-filled data from {url}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
