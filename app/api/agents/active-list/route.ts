import { NextRequest, NextResponse } from 'next/server'
import { API_ENDPOINTS } from '@/lib/api-config'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader) {
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

    console.log('Active agent list API called')
    console.log('Making request to n8n webhook for all agents')

    // Call the n8n webhook for all agents (same as admin dashboard)
    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.AGENT_LIST, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    })

    console.log('N8N webhook response status:', response.status)

    if (!response.ok) {
      console.error('N8N webhook failed with status:', response.status)
      const errorText = await response.text()
      console.error('N8N webhook error response:', errorText)
      
      // Handle 404 errors gracefully - return empty agent list
      if (response.status === 404) {
        console.log('n8n webhook not found (404) - returning empty agent list')
        return NextResponse.json([], { status: 200 })
      }
      
      // Handle 500 workflow errors gracefully
      if (response.status === 500) {
        console.log('n8n webhook workflow error (500) - returning empty agent list')
        return NextResponse.json([], { status: 200 })
      }
      
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "N8N_ERROR",
            message: `N8N webhook failed with status ${response.status}`,
            details: errorText
          }
        },
        { status: response.status }
      )
    }

    // Check if response has content before parsing JSON
    const responseText = await response.text()
    console.log('Response text length:', responseText.length)
    console.log('Response text preview:', responseText.substring(0, 200))

    if (!responseText || responseText.trim() === '') {
      console.log('n8n webhook returned empty response - returning empty agent list')
      return NextResponse.json([], { status: 200 })
    }

    let data
    try {
      data = JSON.parse(responseText)
      console.log('✅ n8n webhook success:', data)
      
      // Extract agents array from response (same as admin dashboard)
      let agents = []
      if (Array.isArray(data)) {
        agents = data
      } else if (data && data.agents && Array.isArray(data.agents)) {
        agents = data.agents
      } else if (data && typeof data === 'object' && data.agent_id) {
        // Handle single agent object
        agents = [data]
      }
      
      console.log('📊 Total agents received:', agents.length)
      
      // Filter for active agents only
      const activeAgents = agents.filter((agent: any) => agent.is_active === true)
      console.log('✅ Active agents filtered:', activeAgents.length)
      console.log('Active agent IDs:', activeAgents.map((agent: any) => agent.agent_id))
      
      return NextResponse.json(activeAgents, { status: 200 })
      
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      console.error('Raw response text:', responseText)
      console.log('Returning empty agent list due to JSON parse error')
      return NextResponse.json([], { status: 200 })
    }
  } catch (error) {
    console.error('Error in active agent list API:', error)
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
