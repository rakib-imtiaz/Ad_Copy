import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, search_for = 'all' } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing required field: accessToken' },
        { status: 400 }
      );
    }

    console.log('👥 Admin - Fetching users with filter:', search_for);
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_USER_INFO);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('📋 Request Body:', { accessToken: accessToken ? '***' : 'NOT PROVIDED', search_for });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_USER_INFO, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        search_for,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Get user info failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch users: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Admin - Users fetched successfully:', result);
    console.log('📊 Response data structure:', Object.keys(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Get user info error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
