import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, agent_id, active_status } = body;

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
    if (active_status === undefined || active_status === null) {
      return NextResponse.json(
        { error: 'Missing required field: active_status' },
        { status: 400 }
      );
    }

    console.log('🔄 Admin - Activating/Deactivating agent:', agent_id, 'Status:', active_status);
    console.log('🔑 Admin - Token exists:', !!accessToken);

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.ACTIVATE_AGENT, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ 
        agent_id, 
        active_status 
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Activation failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to activate/deactivate agent: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    let result;
    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
        console.log('✅ Admin - Agent activation status updated successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        result = { message: 'Agent activation status updated successfully' };
      }
    } else {
      result = { message: 'Agent activation status updated successfully' };
      console.log('✅ Admin - Agent activation status updated successfully (empty response)');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Error activating/deactivating agent:', error);
    return NextResponse.json(
      { error: 'Internal server error while activating/deactivating agent' },
      { status: 500 }
    );
  }
}
