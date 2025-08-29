import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, accessToken } = body;

    if (!email || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: email and accessToken' },
        { status: 400 }
      );
    }

    console.log('👑 Admin - Changing user role for:', email);
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.CHANGE_USER_ROLE);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('📋 Request Body:', { email, accessToken: accessToken ? '***' : 'NOT PROVIDED' });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.CHANGE_USER_ROLE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        email,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Change user role failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to change user role: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Admin - User role changed successfully:', result);
    console.log('📊 Response data structure:', Object.keys(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Change user role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
