import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_FIELDS',
            message: 'Email and password are required' 
          } 
        },
        { status: 400 }
      );
    }

    // Forward the request to n8n webhook
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook/user-log-in';
    
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password
      }),
    });

    // Check for user not found (404 status)
    if (n8nResponse.status === 404) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'USER_NOT_FOUND',
            message: 'User not found. Please check your email or register.' 
          } 
        },
        { status: 404 }
      );
    }

    // Check for authentication failure (401 status)
    if (n8nResponse.status === 401) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password. Please try again.' 
          } 
        },
        { status: 401 }
      );
    }

    // If we got here, the login was successful
    const data = await n8nResponse.json();
    
    // Extract cookies from n8n response to forward them
    const setCookieHeader = n8nResponse.headers.get('set-cookie');
    
    // Create the response object
    const response = NextResponse.json({
      success: true,
      data: {
        user: data.data?.user,
        accessToken: data.data?.accessToken
      }
    });
    
    // If there's a refresh token cookie, forward it
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }
    
    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to process login request' 
        } 
      },
      { status: 500 }
    );
  }
}
