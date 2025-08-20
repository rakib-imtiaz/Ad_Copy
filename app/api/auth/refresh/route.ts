import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken, accessToken } = body;

    console.log('=== REFRESH TOKEN REQUEST START ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    console.log('=== REFRESH TOKEN REQUEST START ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!refreshToken) {
      console.log('Validation failed: Missing refresh token');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_REFRESH_TOKEN',
            message: 'Refresh token is required' 
          } 
        },
        { status: 400 }
      );
    }

    // Forward the request to n8n webhook
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook/refresh-token';
    console.log('Calling n8n endpoint:', n8nEndpoint);
    
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
      },
      body: JSON.stringify({
        refreshToken,
        accessToken // Also send in body for n8n to verify
      }),
    });

    console.log('=== N8N REFRESH RESPONSE ===');
    console.log('Status:', n8nResponse.status);
    console.log('Status Text:', n8nResponse.statusText);
    console.log('Headers:', Object.fromEntries(n8nResponse.headers.entries()));
    console.log('OK:', n8nResponse.ok);

    // Check for invalid refresh token (401 status)
    if (n8nResponse.status === 401) {
      console.log('Invalid refresh token (401)');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid or expired refresh token' 
          } 
        },
        { status: 401 }
      );
    }

    // Check for other errors
    if (!n8nResponse.ok) {
      console.log('Refresh token failed with status:', n8nResponse.status);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'REFRESH_FAILED',
            message: 'Failed to refresh token' 
          } 
        },
        { status: n8nResponse.status }
      );
    }

    // If we got here, the refresh was successful
    console.log('Refresh successful, parsing response...');
    const data = await n8nResponse.json();
    console.log('N8N Refresh Response Data:', JSON.stringify(data, null, 2));
    
    // Extract cookies from n8n response to forward them
    const setCookieHeader = n8nResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    // Create the response object
    const responseData = {
      success: true,
      data: {
        accessToken: data.accessToken || data.data?.accessToken,
        user: data.user || data.data?.user
      }
    };
    console.log('Final refresh response data:', JSON.stringify(responseData, null, 2));
    
    const response = NextResponse.json(responseData);
    
    // If there's a new refresh token cookie, forward it
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
      console.log('Forwarded new Set-Cookie header');
    }
    
    console.log('=== REFRESH TOKEN REQUEST END ===');
    return response;

  } catch (error: any) {
    console.error('=== REFRESH TOKEN ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to process refresh token request' 
        } 
      },
      { status: 500 }
    );
  }
}
