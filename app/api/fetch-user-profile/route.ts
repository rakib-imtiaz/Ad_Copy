import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  console.log('=== FETCH USER PROFILE API ROUTE START ===')
  console.log('Timestamp:', new Date().toISOString())
  
  try {
    const body = await request.json()
    console.log('📥 REQUEST BODY RECEIVED:')
    console.log(JSON.stringify(body, null, 2))
    
    // Get access token from request headers
    const authHeader = request.headers.get('authorization')
    console.log('🔑 AUTHORIZATION HEADER:')
    console.log('Raw header:', authHeader)
    
    const accessToken = authHeader?.replace('Bearer ', '')
    console.log('🔐 ACCESS TOKEN EXTRACTED:')
    console.log('Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NULL')
    console.log('Token length:', accessToken?.length || 0)
    
    if (!accessToken) {
      console.log('❌ ERROR: No access token provided')
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 401 }
      )
    }
    
    // Log all request headers for debugging
    console.log('📋 ALL REQUEST HEADERS:')
    const allHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      allHeaders[key] = value
    })
    console.log(JSON.stringify(allHeaders, null, 2))
    
    // Prepare webhook request using centralized configuration
    const webhookUrl = API_ENDPOINTS.N8N_WEBHOOKS.FETCH_USER_PROFILE
    const webhookHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
    
    console.log('🌐 WEBHOOK REQUEST DETAILS:')
    console.log('URL:', webhookUrl)
    console.log('Method: GET')
    console.log('Headers:', JSON.stringify(webhookHeaders, null, 2))
    console.log('Query Parameters:', { user_email: body.user_email, user_id: body.user_id })
    
    // Forward the request to the webhook
    console.log('🚀 SENDING REQUEST TO WEBHOOK...')
    
    // Build URL with query parameters for GET request
    const url = new URL(webhookUrl)
    url.searchParams.append('user_email', body.user_email)
    if (body.user_id) {
      url.searchParams.append('user_id', body.user_id)
    }
    
    console.log('Final URL:', url.toString())
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: webhookHeaders
    })

    console.log('📡 WEBHOOK RESPONSE RECEIVED:')
    console.log('Status:', response.status)
    console.log('Status Text:', response.statusText)
    console.log('OK:', response.ok)
    
    // Log response headers
    console.log('📋 RESPONSE HEADERS:')
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value
    })
    console.log(JSON.stringify(responseHeaders, null, 2))

    if (response.ok) {
      const result = await response.json()
      console.log('✅ SUCCESS RESPONSE DATA:')
      console.log(JSON.stringify(result, null, 2))
      
      const finalResponse = { success: true, data: result }
      console.log('📤 FINAL API RESPONSE:')
      console.log(JSON.stringify(finalResponse, null, 2))
      
      console.log('=== FETCH USER PROFILE API ROUTE END (SUCCESS) ===')
      return NextResponse.json(finalResponse)
    } else {
      const errorText = await response.text()
      console.log('❌ ERROR RESPONSE TEXT:')
      console.log(errorText)
      
      const errorResponse = { 
        success: false, 
        error: `Webhook request failed: ${response.status} ${response.statusText}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          responseText: errorText
        }
      }
      
      console.log('📤 FINAL ERROR RESPONSE:')
      console.log(JSON.stringify(errorResponse, null, 2))
      
      console.log('=== FETCH USER PROFILE API ROUTE END (ERROR) ===')
      return NextResponse.json(errorResponse, { status: response.status })
    }
  } catch (error) {
    console.error('💥 CATCH ERROR:')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    const errorResponse = {
      success: false,
      error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: {
        errorType: error?.constructor?.name,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
    
    console.log('📤 FINAL CATCH ERROR RESPONSE:')
    console.log(JSON.stringify(errorResponse, null, 2))
    
    console.log('=== FETCH USER PROFILE API ROUTE END (CATCH ERROR) ===')
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
