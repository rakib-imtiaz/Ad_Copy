import { NextRequest, NextResponse } from 'next/server'
import { URLScrapingService } from '@/lib/services/url-scraping-service'

export async function POST(request: NextRequest) {
  try {
    console.log('=== SIMPLIFIED URL SCRAPING API START ===')
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
    const { access_token, url } = body

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

    if (!access_token) {
      console.log('❌ No access_token provided')
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "access_token is required"
          }
        },
        { status: 400 }
      )
    }

    console.log('📋 Scraping URL:', url)
    console.log('📋 Access token provided:', access_token ? 'Yes' : 'No')

    // Use the URL scraping service
    const result = await URLScrapingService.scrapeURL({
      url,
      accessToken: access_token
    })

    if (result.success) {
      console.log('✅ URL scraped successfully')
      return NextResponse.json(result, { status: 200 })
    } else {
      console.log('❌ URL scraping failed:', result.error?.message)
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
