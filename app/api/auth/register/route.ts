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
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook/user-registration';
    
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

    console.log('N8N Response Status:', n8nResponse.status);
    console.log('N8N Response Headers:', Object.fromEntries(n8nResponse.headers.entries()));

    // Check if n8n response has content before parsing
    const responseText = await n8nResponse.text();
    console.log('N8N Response Text:', responseText);
    
    // Check for specific HTTP status codes that indicate user already exists
    if (n8nResponse.status === 409) {
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
    
    let n8nData: any = {};
    if (responseText.trim()) {
      try {
        n8nData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse n8n response:', parseError);
        // If we can't parse the response, check headers as fallback
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
      }
    }
    
    // Check if user already exists based on response body
    if (n8nData && n8nData.user_existance === true) {
      // Check if the message indicates the user is already verified
      const isAlreadyVerified = n8nData.message && 
        (n8nData.message.toLowerCase().includes('already verified') || 
         n8nData.message.toLowerCase().includes('already registered'));
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: isAlreadyVerified ? 'USER_ALREADY_VERIFIED' : 'USER_EXISTS',
            message: n8nData.message || 'A user with this email already exists' 
          } 
        },
        { status: 409 }
      );
    }

    // Check if the response indicates success (status 200-299)
    if (n8nResponse.ok) {
      return NextResponse.json({
        success: true,
        message: 'Registration initiated. Please check your email for verification code.'
      });
    }

    // If we get here, something went wrong
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'REGISTRATION_FAILED',
          message: 'Registration failed. Please try again.' 
        } 
      },
      { status: 500 }
    );

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