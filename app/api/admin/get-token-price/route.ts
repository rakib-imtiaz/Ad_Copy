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

    console.log('💰 Admin - Fetching token prices');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.GET_TOKEN_PRICE);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.GET_TOKEN_PRICE, {
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
      console.error('❌ Admin - Get token price failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to fetch token prices: ${response.status}` },
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
        console.log('✅ Admin - Token prices fetched successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        result = { error: 'Invalid JSON response from server' };
      }
    } else {
      // Empty response - return error
      result = { error: 'Empty response from server' };
      console.log('❌ Admin - Empty response from token price API');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Get token price error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
