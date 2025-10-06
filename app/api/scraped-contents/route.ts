import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function DELETE(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const body = await request.json()
    const { file_name } = body
    

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    if (!file_name) {
      return NextResponse.json({ error: 'File name is required' }, { status: 400 })
    }


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


    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      
      return NextResponse.json(
        { 
          error: `Failed to delete scraped content: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    
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
