import { NextRequest, NextResponse } from 'next/server';
import { API_ENDPOINTS } from '@/lib/api-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, accessToken } = body;

    if (!userId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: userId and accessToken' },
        { status: 400 }
      );
    }

    console.log('🗑️ Admin - Deleting user:', userId);

    const response = await fetch(API_ENDPOINTS.N8N_WEBHOOKS.DELETE_USER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        accessToken,
      }),
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Admin - Delete user failed:', response.status, errorText);
      return NextResponse.json(
        { error: `Failed to delete user: ${response.status}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('✅ Admin - User deleted successfully:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Admin - Delete user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
