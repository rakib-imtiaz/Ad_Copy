import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const { file_name } = body
    
    console.log('🗑️ Scraped content delete API route called')
    console.log('📡 Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔍 Access token present:', !!accessToken)
    console.log('🔍 Access token length:', accessToken?.length || 0)
    console.log('🔍 File name to delete:', file_name)

    if (!accessToken) {
      console.error('❌ No access token provided')
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    if (!file_name) {
      console.error('❌ No file name provided')
      return NextResponse.json({ error: 'File name is required' }, { status: 400 })
    }

    console.log('🔄 Deleting scraped content from n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.DELETE_SCRAPED_CONTENT)

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.DELETE_SCRAPED_CONTENT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_name: file_name
      }),
    })

    console.log('📡 n8n delete response status:', response.status)
    console.log('📡 n8n delete response status text:', response.statusText)

    if (!response.ok) {
      console.error('❌ n8n delete webhook failed:', response.status, response.statusText)
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('Error response:', errorText)
      
      return NextResponse.json(
        { 
          error: `Failed to delete scraped content: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ Scraped content deleted successfully:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Scraped content deleted successfully',
      data: data
    })

  } catch (error) {
    console.error('❌ Error in scraped content delete:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    console.log('🔄 Scraped contents API route called')
    console.log('📡 Request headers:', Object.fromEntries(request.headers.entries()))
    console.log('🔍 Access token present:', !!accessToken)
    console.log('🔍 Access token length:', accessToken?.length || 0)

    if (!accessToken) {
      console.error('❌ No access token provided')
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    console.log('🔄 Fetching scraped contents list from n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_SCRAPED_CONTENTS)

    console.log('🔍 Making request to n8n webhook...')
    console.log('🔍 Request URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_SCRAPED_CONTENTS)
    console.log('🔍 Request method: GET')
    console.log('🔍 Full access token length:', accessToken.length)
    console.log('🔍 Access token preview:', accessToken.substring(0, 50) + '...')
    console.log('🔍 Request headers:', {
      'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
      'Content-Type': 'application/json',
    })

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_SCRAPED_CONTENTS, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('📡 n8n response status:', response.status)
    console.log('📡 n8n response status text:', response.statusText)

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText)
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('Error response:', errorText)
      
      // Handle 404 errors gracefully - return empty scraped contents
      if (response.status === 404) {
        console.log('n8n webhook not found (404) - returning empty scraped contents')
        return NextResponse.json({
          success: true,
          data: []
        })
      }
      
      // Handle 500 workflow errors gracefully
      if (response.status === 500) {
        console.log('n8n webhook workflow error (500) - returning empty scraped contents')
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
    console.log('Response text length:', responseText.length)
    console.log('Response text preview:', responseText.substring(0, 200))

    if (!responseText || responseText.trim() === '') {
      console.error('❌ Empty response from n8n webhook')
      return NextResponse.json(
        { error: 'Empty response from scraping service' },
        { status: 500 }
      )
    }

    let data
    try {
      data = JSON.parse(responseText)
      console.log('✅ n8n webhook success - Raw data:')
      console.log('📊 Data type:', typeof data)
      console.log('📊 Is array:', Array.isArray(data))
      console.log('📊 Data length:', Array.isArray(data) ? data.length : 'N/A')
      console.log('📊 Full JSON response:')
      console.log(JSON.stringify(data, null, 2))
      
      // Log each item if it's an array
      if (Array.isArray(data)) {
        console.log('📊 Array items breakdown:')
        data.forEach((item, index) => {
          console.log(`📄 Item ${index + 1}:`)
          console.log(`   Type: ${typeof item}`)
          console.log(`   Keys: ${Object.keys(item || {}).join(', ')}`)
          console.log(`   Content:`, JSON.stringify(item, null, 2))
        })
      } else if (typeof data === 'object' && data !== null) {
        console.log('📊 Object keys:', Object.keys(data))
        console.log('📊 Object values:', Object.values(data))
      }
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      console.error('Raw response text:', responseText)
      console.error('Response text length:', responseText.length)
      console.error('Response text preview (first 500 chars):', responseText.substring(0, 500))
      
      return NextResponse.json(
        { error: 'Invalid JSON response from scraping service' },
        { status: 500 }
      )
    }

    // Extract the actual scraped content items from the n8n response
    let scrapedItems = []
    console.log('🔍 Data structure analysis:')
    console.log('🔍 Data type:', typeof data)
    console.log('🔍 Data keys:', Object.keys(data || {}))
    console.log('🔍 Has all_records:', data && data.all_records ? 'YES' : 'NO')
    console.log('🔍 all_records type:', typeof data?.all_records)
    console.log('🔍 all_records is array:', Array.isArray(data?.all_records))
    console.log('🔍 all_records length:', data?.all_records?.length || 'N/A')
    
    if (Array.isArray(data) && data.length > 0 && data[0] && data[0].all_records && Array.isArray(data[0].all_records)) {
      // Handle case where data is an array with objects containing all_records
      scrapedItems = data[0].all_records
      console.log('📊 Extracted scraped items from data[0].all_records:', scrapedItems.length)
    } else if (data && typeof data === 'object' && data.all_records && Array.isArray(data.all_records)) {
      // Handle case where data is a single object with all_records
      scrapedItems = data.all_records
      console.log('📊 Extracted scraped items from all_records:', scrapedItems.length)
    } else if (Array.isArray(data)) {
      // Fallback: try to use the data directly if it's an array
      scrapedItems = data
      console.log('📊 Using data directly as scraped items:', scrapedItems.length)
    } else {
      console.log('⚠️ No valid scraped content structure found')
      console.log('⚠️ Data structure:', JSON.stringify(data, null, 2))
    }

    console.log('📊 Final scraped items to return:', scrapedItems.length)
    console.log('📊 Final scraped items data:', JSON.stringify(scrapedItems, null, 2))
    return NextResponse.json({
      success: true,
      data: scrapedItems
    })

  } catch (error) {
    console.error('❌ Error in scraped contents proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
