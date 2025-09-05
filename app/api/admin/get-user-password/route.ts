import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function GET(request: NextRequest) {
  console.log('🌐 [API ROUTE] get-user-password API called');
  
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const authHeader = request.headers.get('authorization');

    console.log('📧 [API ROUTE] Email parameter:', email);
    console.log('🔑 [API ROUTE] Auth header exists:', !!authHeader);
    console.log('🔑 [API ROUTE] Auth header preview:', authHeader ? `${authHeader.substring(0, 20)}...` : 'null');

    if (!email) {
      console.error('❌ [API ROUTE] Email parameter is missing');
      return NextResponse.json(
        { error: 'Email parameter is required' },
        { status: 400 }
      );
    }

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ [API ROUTE] Authorization header is missing or invalid');
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    const n8nUrl = `${API_ENDPOINTS.N8N_WEBHOOKS.SEE_USER_PASSWORD}?email=${encodeURIComponent(email)}`;
    console.log('🌐 [API ROUTE] Forwarding request to n8n webhook:', n8nUrl);
    console.log('📋 [API ROUTE] Request headers:', {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    });

    // Forward the request to the n8n webhook
    const response = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    console.log('📡 [API ROUTE] n8n response status:', response.status);
    console.log('📡 [API ROUTE] n8n response ok:', response.ok);
    console.log('📡 [API ROUTE] n8n response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('❌ [API ROUTE] n8n response not ok, status:', response.status);
      
      let errorData;
      try {
        errorData = await response.json();
        console.log('❌ [API ROUTE] n8n error data:', errorData);
      } catch (parseError) {
        console.error('❌ [API ROUTE] Failed to parse n8n error response:', parseError);
        errorData = {};
      }
      
      const errorMessage = errorData.message || 'Failed to get user password';
      console.error('❌ [API ROUTE] Returning error to client:', errorMessage);
      
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    console.log('✅ [API ROUTE] n8n response ok, parsing data...');
    const data = await response.json();
    console.log('📊 [API ROUTE] n8n response data:', data);
    console.log('📊 [API ROUTE] Data type:', typeof data);
    console.log('📊 [API ROUTE] Is array:', Array.isArray(data));
    
    console.log('✅ [API ROUTE] Returning data to client');
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('💥 [API ROUTE] Error in get-user-password API:', error);
    console.error('💥 [API ROUTE] Error message:', error.message);
    console.error('💥 [API ROUTE] Error stack:', error.stack);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
