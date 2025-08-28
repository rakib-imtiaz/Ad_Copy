import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '')
    const url = request.nextUrl.searchParams.get('url')

    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 401 })
    }

    if (!url) {
      return NextResponse.json({ error: 'URL parameter required' }, { status: 400 })
    }

    console.log('🔄 Proxying webpage scrape request to n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.WEBPAGE_SCRAPE)
    console.log('Scraping URL:', url)

    const response = await fetch(`${API_ENDPOINTS.N8N_WEBHOOKS.WEBPAGE_SCRAPE}?url=${encodeURIComponent(url)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('n8n response status:', response.status)

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText)
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('Error response:', errorText)
      
      return NextResponse.json(
        { error: `n8n webhook failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Check if response has content
    const responseText = await response.text()
    console.log('Response text length:', responseText.length)
    console.log('Response text preview:', responseText.substring(0, 200))
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))

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
      console.log('✅ n8n webhook success:', data)
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      console.error('Raw response:', responseText)
      
      // If it's not JSON, treat it as plain text content
      data = [{ text: responseText }]
      console.log('✅ Treating response as plain text content')
    }

    // Save the scraped content as HTML
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
      const filename = `scraped_content_${timestamp}.html`
      
      // Create HTML content with proper formatting
      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Scraped Content from ${url}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; }
        h3 { color: #7f8c8d; }
        .metadata { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }
        .content { margin-top: 30px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #7f8c8d; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>Scraped Content from ${url}</h1>
    
    <div class="metadata">
        <p><strong>Scraped on:</strong> ${new Date().toLocaleString()}</p>
        <p><strong>Source URL:</strong> <a href="${url}" target="_blank">${url}</a></p>
    </div>
    
    <div class="content">
        ${data && data.length > 0 && data[0]?.text ? data[0].text : (typeof data === 'string' ? data : 'No content found')}
    </div>
    
    <div class="footer">
        <p><em>This content was automatically scraped by Copy Ready Platform</em></p>
    </div>
</body>
</html>`

      // Save to n8n storage
      const saveResponse = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.SAVE_SCRAPED_CONTENT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: filename,
          content: htmlContent,
          source_url: url,
          scraped_at: new Date().toISOString()
        }),
      })

      if (saveResponse.ok) {
        const saveData = await saveResponse.json()
        console.log('✅ Content saved successfully:', saveData)
        
        return NextResponse.json({
          success: true,
          message: 'Content scraped and saved successfully',
          filename: filename,
          data: data
        })
      } else {
        console.error('❌ Failed to save content:', saveResponse.status)
        return NextResponse.json({
          success: true,
          message: 'Content scraped but failed to save',
          data: data
        })
      }
    } catch (saveError) {
      console.error('❌ Error saving content:', saveError)
      return NextResponse.json({
        success: true,
        message: 'Content scraped but failed to save',
        data: data
      })
    }
  } catch (error) {
    console.error('❌ Error in webpage scrape proxy:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
