import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verification_code } = body;

    // Validate required fields
    if (!email || !verification_code) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_FIELDS',
            message: 'Email and verification code are required' 
          } 
        },
        { status: 400 }
      );
    }

    // Forward the request to n8n webhook
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook-test/verification-code-validate';
    
    const n8nResponse = await fetch(n8nEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        verification_code
      }),
    });

    if (!n8nResponse.ok) {
      // Return error from n8n if available
      try {
        const errorData = await n8nResponse.json();
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VERIFICATION_FAILED',
              message: errorData.message || 'Verification failed' 
            } 
          },
          { status: n8nResponse.status }
        );
      } catch (e) {
        // If we can't parse the error, return a generic one
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'VERIFICATION_FAILED',
              message: 'Verification failed' 
            } 
          },
          { status: n8nResponse.status }
        );
      }
    }

    // Success - return the response from n8n
    const data = await n8nResponse.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to process verification request' 
        } 
      },
      { status: 500 }
    );
  }
}