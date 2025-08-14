import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

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
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook-test/user-registration';
    
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        name: fullName || email.split('@')[0] // Use part of email as name if not provided
      }),
    });

    // Check headers for user existence
    const userExistHeader = n8nResponse.headers.get('user-existance');
    if (userExistHeader === 'true') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'USER_EXISTS',
            message: 'A user with this email already exists' 
          } 
        },
        { status: 409 }
      );
    }

    // If we got here, registration was initiated successfully
    return NextResponse.json({
      success: true,
      message: 'Registration initiated. Please check your email for verification code.'
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to process registration request' 
        } 
      },
      { status: 500 }
    );
  }
}