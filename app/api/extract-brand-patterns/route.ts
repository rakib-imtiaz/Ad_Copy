import { NextRequest, NextResponse } from 'next/server'
import { BrandPatternExtractionService } from '@/lib/services/brand-pattern-extraction-service'

export async function POST(request: NextRequest) {
  try {
    console.log('=== BRAND PATTERN EXTRACTION API START ===')
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

    // Parse the request body
    const body = await request.json()
    const { url } = body

    if (!url) {
      console.log('❌ No URL provided')
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

    console.log('📋 Extracting patterns from URL:', url)

    // Extract access token from authorization header
    const accessToken = authHeader.replace('Bearer ', '')

    // Use the brand pattern extraction service
    const result = await BrandPatternExtractionService.extractPatterns({
      url,
      accessToken
    })

    if (result.success) {
      console.log('✅ Brand pattern extraction successful')
      console.log('📊 Extracted patterns:', result.data?.patterns.length || 0)
      return NextResponse.json(result, { status: 200 })
    } else {
      console.log('❌ Brand pattern extraction failed:', result.error?.message)
      return NextResponse.json(result, { status: 400 })
    }

  } catch (error) {
    console.error('❌ API Error:', error)
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
