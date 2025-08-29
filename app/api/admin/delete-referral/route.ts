import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, referral_code } = body;

    if (!accessToken || !referral_code) {
      return NextResponse.json(
        { error: 'Missing required fields: accessToken, referral_code' },
        { status: 400 }
      );
    }

    console.log('🗑️ Admin - Deleting referral code');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.DELETE_REFERRAL);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('🎫 Referral Code:', referral_code);

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.DELETE_REFERRAL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        referral_code: referral_code,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Delete referral failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete referral code: ${response.status}` },
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
        console.log('✅ Admin - Referral code deleted successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        result = { message: 'Referral code deleted successfully' };
      }
    } else {
      // Empty response - consider it successful
      result = { message: 'Referral code deleted successfully' };
      console.log('✅ Admin - Referral code deleted successfully (empty response)');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Delete referral error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
