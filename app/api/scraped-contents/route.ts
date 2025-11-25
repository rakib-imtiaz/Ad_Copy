import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ DELETE /api/scraped-contents - Starting delete request')

    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const { file_name, resource_id } = body

    console.log('📋 Delete request body:', { file_name, resource_id })
    console.log('🔑 Access token present:', !!accessToken)
    console.log('🔍 Resource ID type:', typeof resource_id)
    console.log('🔍 Resource ID value:', resource_id)

    if (!accessToken) {
      console.error('❌ No access token provided')
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    if (!file_name && !resource_id) {
      console.error('❌ Neither file_name nor resource_id provided')
      return NextResponse.json({ error: 'File name or resource ID is required' }, { status: 400 })
    }

    // Use resource_id if available, otherwise fall back to file_name
    const deletePayload = resource_id ? {
      access_token: accessToken,
      resource_id: resource_id
    } : {
      access_token: accessToken,
      file_name: file_name
    }
    console.log('📤 Delete payload:', deletePayload)
    console.log('🔗 Webhook URL:', API_ENDPOINTS.N8N_WEBHOOKS.DELETE_SCRAPED_CONTENT)

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.DELETE_SCRAPED_CONTENT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(deletePayload),
    })

    console.log('📡 Webhook response status:', response.status)
    console.log('📡 Webhook response headers:', Object.fromEntries(response.headers.entries()))


    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('❌ Webhook delete failed:', response.status, response.statusText)
      console.error('❌ Error response text:', errorText)

      return NextResponse.json(
        {
          error: `Failed to delete scraped content: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Webhook delete successful, response data:', data)

    return NextResponse.json({
      success: true,
      message: 'Scraped content deleted successfully',
      data: data
    })

  } catch (error) {
    console.error('Scraped content delete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')


    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }


    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_SCRAPED_CONTENTS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })


    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')

      // Handle 404 errors gracefully - return empty scraped contents
      if (response.status === 404) {
        return NextResponse.json({
          success: true,
          data: []
        })
      }

      // Handle 500 workflow errors gracefully
      if (response.status === 500) {
        return NextResponse.json({
          success: true,
          data: []
        })
      }

      return NextResponse.json(
        { error: `n8n webhook failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Check if response has content
    const responseText = await response.text()

    if (!responseText || responseText.trim() === '') {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON response from scraping service' },
        { status: 500 }
      )
    }

    // Extract the actual scraped content items from the n8n response
    let scrapedItems = []

    if (Array.isArray(data) && data.length > 0 && data[0] && data[0].all_records && Array.isArray(data[0].all_records)) {
      // Handle case where data is an array with objects containing all_records
      scrapedItems = data[0].all_records
    } else if (data && typeof data === 'object' && data.all_records && Array.isArray(data.all_records)) {
      // Handle case where data is a single object with all_records
      scrapedItems = data.all_records
    } else if (Array.isArray(data)) {
      // Fallback: try to use the data directly if it's an array
      scrapedItems = data
    }

    // Debug: Log available resource_ids
    // console.log('📊 Available scraped items with resource_ids:')
    // scrapedItems.forEach((item: any, index: number) => {
    //   console.log(`  ${index + 1}. resource_id: ${item.resource_id}, resource_name: ${item.resource_name}`)
    // })
    return NextResponse.json({
      success: true,
      data: scrapedItems
    })

  } catch (error) {
    console.error('Scraped contents error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
