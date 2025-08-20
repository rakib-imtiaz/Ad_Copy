import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('API route /api/upload-knowledge-base called')
  
  try {
    const body = await request.json()
    console.log('Received body:', JSON.stringify(body, null, 2))
    
    // Forward the request to the webhook
    console.log('Sending request to webhook...')
    const response = await fetch('https://n8n.srv934833.hstgr.cloud/webhook-test/upload-knowledge-base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE', // Replace with actual access token
      },
      body: JSON.stringify(body)
    })

    console.log('Webhook response status:', response.status)
    console.log('Webhook response status text:', response.statusText)

    if (response.ok) {
      const result = await response.json()
      console.log('Webhook response data:', result)
      return NextResponse.json({ success: true, data: result })
    } else {
      const errorText = await response.text()
      console.error('Webhook request failed:', response.status, response.statusText, errorText)
      return NextResponse.json(
        { success: false, error: `Webhook request failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error('Error in upload-knowledge-base API route:', error)
    return NextResponse.json(
      { success: false, error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
