import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing required field: accessToken' },
        { status: 400 }
      );
    }

    console.log('🤖 Admin - Fetching agent list');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.AGENT_LIST);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.AGENT_LIST, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Get agent list failed:', response.status, errorText);
      
      // Handle 404 errors gracefully - return empty agent list
      if (response.status === 404) {
        console.log('n8n webhook not found (404) - returning empty agent list')
        return NextResponse.json({
          success: true,
          agents: []
        })
      }
      
      // Handle 500 workflow errors gracefully
      if (response.status === 500) {
        console.log('n8n webhook workflow error (500) - returning empty agent list')
        return NextResponse.json({
          success: true,
          agents: []
        })
      }
      
      return NextResponse.json(
        { error: `Failed to fetch agent list: ${response.status}` },
        { status: response.status }
      );
    }

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    console.log('📡 Response text length:', responseText.length);
    console.log('📡 Response text preview:', responseText.substring(0, 200));
    
    let result;
    if (!responseText || responseText.trim() === '') {
      console.log('n8n webhook returned empty response - returning empty agent list');
      result = { agents: [] };
    } else {
      try {
        result = JSON.parse(responseText);
        console.log('✅ Admin - Agent list fetched successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        console.error('Raw response text:', responseText);
        console.log('Returning empty agent list due to JSON parse error');
        result = { agents: [] };
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Get agent list error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
