import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, agent_id, system_prompt } = body;

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

    if (!system_prompt) {
      return NextResponse.json(
        { error: 'Missing required field: system_prompt' },
        { status: 400 }
      );
    }

    console.log('✏️ Admin - Updating system prompt');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.UPDATE_SYSTEM_PROMPT);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('📋 Request Body:', { 
      accessToken: accessToken ? '***' : 'NOT PROVIDED', 
      agent_id,
      system_prompt: system_prompt.substring(0, 100) + (system_prompt.length > 100 ? '...' : '')
    });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.UPDATE_SYSTEM_PROMPT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        agent_id,
        system_prompt,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Update system prompt failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to update system prompt: ${response.status}` },
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
        console.log('✅ Admin - System prompt updated successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        result = { message: 'System prompt updated successfully' };
      }
    } else {
      // Empty response - return success message
      result = { message: 'System prompt updated successfully' };
      console.log('✅ Admin - System prompt updated successfully (empty response)');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Update system prompt error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
