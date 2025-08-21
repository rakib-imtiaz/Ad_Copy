import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== REFERRAL CODE APPLY API ROUTE START ===')
  console.log('Timestamp:', new Date().toISOString())

  try {
    // Parse the request body
    const body = await request.json()
    console.log('📥 Request body:', JSON.stringify(body, null, 2))

    const { referralCode, accessToken } = body

    // Validate required fields
    if (!referralCode || !accessToken) {
      console.log('❌ Missing required fields')
      return NextResponse.json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Referral code and access token are required'
        }
      }, { status: 400 })
    }

    // Prepare the request to n8n webhook
    const n8nUrl = 'https://n8n.srv934833.hstgr.cloud/webhook/referrel-apply'
    
    console.log('🌐 Calling n8n endpoint:', n8nUrl)
    console.log('📤 Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken.substring(0, 20)}...`
    })
    console.log('📤 Request payload:', JSON.stringify({
      referral_code: referralCode
    }, null, 2))

    // Make request to n8n webhook
    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        referral_code: referralCode
      })
    })

    console.log('📡 N8N Response Status:', response.status)
    console.log('📡 N8N Response Status Text:', response.statusText)
    console.log('📡 N8N Response OK:', response.ok)

    // Log response headers
    console.log('📋 N8N RESPONSE HEADERS:')
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    console.log(JSON.stringify(responseHeaders, null, 2))

    if (response.ok) {
      const result = await response.json()
      console.log('✅ N8N Response Data:', JSON.stringify(result, null, 2))
      
      // Forward the n8n response
      console.log('📤 FINAL API RESPONSE:')
      console.log(JSON.stringify(result, null, 2))
      console.log('=== REFERRAL CODE APPLY API ROUTE END (SUCCESS) ===')
      
      return NextResponse.json(result)
    } else {
      const errorText = await response.text()
      console.log('❌ N8N Error Response:', errorText)
      
      const errorResponse = {
        success: false,
        error: {
          code: 'N8N_ERROR',
          message: `Failed to apply referral code: ${response.status} ${response.statusText}`,
          details: errorText
        }
      }
      
      console.log('📤 FINAL API ERROR RESPONSE:')
      console.log(JSON.stringify(errorResponse, null, 2))
      console.log('=== REFERRAL CODE APPLY API ROUTE END (ERROR) ===')
      
      return NextResponse.json(errorResponse, { status: response.status })
    }

  } catch (error) {
    console.error('❌ Exception during referral code application:', error)
    
    const errorResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during referral code application',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }
    
    console.log('📤 FINAL API ERROR RESPONSE:')
    console.log(JSON.stringify(errorResponse, null, 2))
    console.log('=== REFERRAL CODE APPLY API ROUTE END (EXCEPTION) ===')
    
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
