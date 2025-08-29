import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, agent_id } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing required field: accessToken' },
        { status: 400 }
      );
    }

    if (!agent_id) {
      return NextResponse.json(
        { error: 'Missing required field: agent_id' },
        { status: 400 }
      );
    }

    console.log('🗑️ Admin - Deleting agent');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.DELETE_AGENT);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('📋 Request Body:', { 
      accessToken: accessToken ? '***' : 'NOT PROVIDED', 
      agent_id 
    });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.DELETE_AGENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        agent_id,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Delete agent failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete agent: ${response.status}` },
        { status: response.status }
      );
    }

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    console.log('📡 Response text:', responseText);
    
    let result;
    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
        console.log('✅ Admin - Agent deleted successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        result = { message: 'Agent deleted successfully' };
      }
    } else {
      // Empty response - return success message
      result = { message: 'Agent deleted successfully' };
      console.log('✅ Admin - Agent deleted successfully (empty response)');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Delete agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
