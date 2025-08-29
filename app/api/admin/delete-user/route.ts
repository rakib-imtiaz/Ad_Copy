import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, accessToken } = body;

    if (!email || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: email and accessToken' },
        { status: 400 }
      );
    }

    console.log('🗑️ Admin - Deleting user:', email);
    console.log('🔗 URL:', API_ENDPOINTS.N8N_WEBHOOKS.DELETE_USER);
    console.log('🔑 Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'NOT PROVIDED');
    console.log('📋 Request Body:', { email, accessToken: accessToken ? '***' : 'NOT PROVIDED' });

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.DELETE_USER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        delete_for: email,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Delete user failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete user: ${response.status}` },
        { status: response.status }
      );
    }

    const responseText = await response.text();
    let result;
    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
        console.log('✅ Admin - User deleted successfully:', result);
      } catch (parseError) {
        console.error('❌ Admin - JSON parse error:', parseError);
        result = { message: 'User deleted successfully' };
      }
    } else {
      result = { message: 'User deleted successfully' };
      console.log('✅ Admin - User deleted successfully (empty response)');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
