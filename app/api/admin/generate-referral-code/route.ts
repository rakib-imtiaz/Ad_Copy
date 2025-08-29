import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      accessToken, 
      referral_code, 
      allocated_credit, 
      limit, 
      user_redeem_limit 
    } = body;

    if (!accessToken || !referral_code || !allocated_credit || !limit || !user_redeem_limit) {
      return NextResponse.json(
        { error: 'Missing required fields: accessToken, referral_code, allocated_credit, limit, user_redeem_limit' },
        { status: 400 }
      );
    }

    console.log('🎫 Admin - Generating referral code:', referral_code);
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.GENERATE_REFERRAL_CODE);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('📋 Request Body:', { 
      referral_code, 
      allocated_credit, 
      limit, 
      user_redeem_limit,
      accessToken: accessToken ? '***' : 'NOT PROVIDED' 
    });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GENERATE_REFERRAL_CODE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        referral_code,
        allocated_credit,
        limit,
        user_redeem_limit,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Generate referral code failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to generate referral code: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Admin - Referral code generated successfully:', result);
    console.log('📊 Response data structure:', Object.keys(result));

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Generate referral code error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
