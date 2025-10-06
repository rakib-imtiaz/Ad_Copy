import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Test API Route: Testing knowledge base webhook')
    
    const body = await request.json()
    const { access_token } = body
    
    if (!access_token) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      )
    }

    console.log('📡 Making request to webhook:', API_ENDPOINTS.N8N_WEBHOOKS.GET_KNOWLEDGE_BASE_IN_FIELD)
    console.log('🔑 Access token:', access_token.substring(0, 20) + '...')

    // Make the request to the webhook from the server side
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_KNOWLEDGE_BASE_IN_FIELD, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${access_token}`
      }
    })

    console.log('📊 Webhook Response Status:', response.status)
    console.log('📊 Webhook Response OK:', response.ok)

    const responseText = await response.text()
    console.log('📋 Webhook Response Body:', responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
      console.log('⚠️ Could not parse response as JSON:', parseError)
      responseData = { raw_response: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      webhook_url: API_ENDPOINTS.N8N_WEBHOOKS.GET_KNOWLEDGE_BASE_IN_FIELD
    })

  } catch (error: any) {
    console.error('❌ Error in test API route:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to test webhook',
        details: error.message,
        webhook_url: API_ENDPOINTS.N8N_WEBHOOKS.GET_KNOWLEDGE_BASE_IN_FIELD
      },
      { status: 500 }
    )
  }
}
