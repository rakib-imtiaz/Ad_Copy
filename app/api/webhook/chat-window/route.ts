import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      )
    }

    // Get the request body
    const body = await request.json()
    const { session_id, user_prompt, agent_id, scraped_content, knowledge_base } = body

    if (!session_id || !user_prompt) {
      return NextResponse.json(
        { error: 'session_id and user_prompt are required' },
        { status: 400 }
      )
    }

    // Extract access token from authorization header
    const accessToken = authHeader.replace('Bearer ', '')

    console.log('💬 Proxying chat window request to n8n...')
    console.log('Target URL:', API_ENDPOINTS.N8N_WEBHOOKS.CHAT_WINDOW)
    console.log('Session ID:', session_id)
    console.log('User Prompt:', user_prompt)
    console.log('Agent ID:', agent_id || 'Not provided')
    console.log('Access Token:', accessToken ? '***' + accessToken.slice(-4) : 'Not provided')
    
    // Log scraped content if present
    if (scraped_content && scraped_content.length > 0) {
      console.log('📄 SCRAPED CONTENT BEING SENT TO N8N:')
      console.log('  - Scraped content count:', scraped_content.length)
      scraped_content.forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. ${item.filename} (${item.type})`)
        console.log(`     Content length: ${item.content ? item.content.length : 0}`)
        console.log(`     Transcript length: ${item.transcript ? item.transcript.length : 0}`)
      })
    } else {
      console.log('📄 No scraped content in this request')
    }
    
    // Log knowledge base if present
    if (knowledge_base && knowledge_base.length > 0) {
      console.log('📚 KNOWLEDGE BASE BEING SENT TO N8N:')
      console.log('  - Knowledge base count:', knowledge_base.length)
      knowledge_base.forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. ${item.filename} (${item.type})`)
        console.log(`     Content length: ${item.content ? item.content.length : 0}`)
        console.log(`     Transcript length: ${item.transcript ? item.transcript.length : 0}`)
      })
    } else {
      console.log('📚 No knowledge base in this request')
    }

    // Forward the request to n8n webhook
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.CHAT_WINDOW, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id,
        user_prompt,
        agent_id,
        scraped_content: scraped_content || undefined,
        knowledge_base: knowledge_base || undefined
      }),
      signal: AbortSignal.timeout(60000), // 60 second timeout for chat
    })

    console.log('n8n response status:', response.status)

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText)
      const errorData = await response.text()
      console.error('n8n error details:', errorData)
      
      return NextResponse.json(
        { error: `n8n webhook failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    // Check if response has content before trying to parse JSON
    const responseText = await response.text()
    console.log('Raw n8n response:', responseText)
    
    let data
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText)
        console.log('✅ n8n webhook success:', data)
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError)
        console.log('Response text:', responseText)
        // Return the raw text as a fallback
        return NextResponse.json({
          response: responseText || 'Received response from n8n (not JSON)',
          raw_response: responseText
        })
      }
    } else {
      console.log('⚠️ n8n webhook returned empty response')
      data = {
        response: 'Oops! There seems to be an error. Could you please refresh the page or start a new conversation? It\'s not gonna happen again, I promise! 😢',
        empty_response: true
      }
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error proxying chat window request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
