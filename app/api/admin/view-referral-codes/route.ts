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

    console.log('📋 Admin - Fetching referral codes');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.VIEW_REFERRAL_CODES);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.VIEW_REFERRAL_CODES, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Fetch referral codes failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch referral codes: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Admin - Referral codes fetched successfully:', result);
    console.log('📊 Response data structure:', Object.keys(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Fetch referral codes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
