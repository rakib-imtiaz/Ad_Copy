import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      accessToken, 
      claude_input_token_price, 
      claude_output_token_price, 
      openai_embedding_token_price, 
      rapidapi_token_price,
      elevenlabs_token_price
    } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing required field: accessToken' },
        { status: 400 }
      );
    }

    console.log('💰 Admin - Setting token prices');
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.SET_TOKEN_PRICE);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    // Create updates array with only filled fields
    const updates: Array<{service_name: string, price: number}> = [];
    
    // Only include fields that have values (not null)
    if (claude_input_token_price !== null && claude_input_token_price !== undefined) {
      updates.push({
        service_name: 'claude_input_token_price',
        price: claude_input_token_price
      });
    }
    if (claude_output_token_price !== null && claude_output_token_price !== undefined) {
      updates.push({
        service_name: 'claude_output_token_price',
        price: claude_output_token_price
      });
    }
    if (openai_embedding_token_price !== null && openai_embedding_token_price !== undefined) {
      updates.push({
        service_name: 'openai_embedding_token_price',
        price: openai_embedding_token_price
      });
    }
    if (rapidapi_token_price !== null && rapidapi_token_price !== undefined) {
      updates.push({
        service_name: 'rapidapi_token_price',
        price: rapidapi_token_price
      });
    }
    if (elevenlabs_token_price !== null && elevenlabs_token_price !== undefined) {
      updates.push({
        service_name: 'elevenlabs_token_price',
        price: elevenlabs_token_price
      });
    }

    console.log('📊 Token Price Updates:', { updates });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.SET_TOKEN_PRICE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        updates: updates
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Set token price failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to set token prices: ${response.status}` },
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
        console.log('✅ Admin - Token prices set successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        result = { message: 'Token prices updated successfully' };
      }
    } else {
      // Empty response - consider it successful
      result = { message: 'Token prices updated successfully' };
      console.log('✅ Admin - Token prices set successfully (empty response)');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Set token price error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
