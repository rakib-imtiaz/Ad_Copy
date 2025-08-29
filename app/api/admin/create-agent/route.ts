import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, agent_id, system_prompt, short_description } = body;

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

    if (!short_description) {
      return NextResponse.json(
        { error: 'Missing required field: short_description' },
        { status: 400 }
      );
    }

    console.log('🤖 Admin - Creating agent');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.CREATE_AGENT);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('📋 Request Body:', { 
      accessToken: accessToken ? '***' : 'NOT PROVIDED', 
      agent_id, 
      system_prompt, 
      short_description,
      is_active: true
    });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.CREATE_AGENT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        agent_id,
        system_prompt,
        short_description,
        is_active: true, // Set agent as active when created from admin dashboard
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Create agent failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to create agent: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Admin - Agent created successfully:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Create agent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
