import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verification_code } = body;

    console.log('=== VERIFICATION REQUEST START ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!email || !verification_code) {
      console.log('Validation failed: Missing required fields');
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
    const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook/verification-code-validate';
    console.log('Calling n8n endpoint:', n8nEndpoint);
    
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

    console.log('=== N8N VERIFICATION RESPONSE ===');
    console.log('Status:', n8nResponse.status);
    console.log('Status Text:', n8nResponse.statusText);
    console.log('Headers:', Object.fromEntries(n8nResponse.headers.entries()));
    console.log('OK:', n8nResponse.ok);

    if (!n8nResponse.ok) {
      console.log('Verification failed with status:', n8nResponse.status);
      // Return error from n8n if available
      try {
        const errorData = await n8nResponse.json();
        console.log('N8N Error Data:', JSON.stringify(errorData, null, 2));
        
        // Handle specific n8n header error
        if (errorData.message && errorData.message.includes('Header name must be a valid HTTP token')) {
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'N8N_CONFIG_ERROR',
                message: 'Verification service is temporarily unavailable. Please try again later or contact support.' 
              } 
            },
            { status: 503 }
          );
        }
        
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

    // Parse the response from n8n
    console.log('Parsing n8n response...');
    const data = await n8nResponse.json();
    console.log('N8N Verification Response Data:', JSON.stringify(data, null, 2));
    
    // Check if n8n returned an error status in the response body
    if (data.status === 'error' || data.success === false) {
      console.log('N8N returned error status in response body');
      
      // Handle specific cases for already verified users
      if (data.message && data.message.toLowerCase().includes('already verified')) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'ALREADY_VERIFIED',
              message: 'This email is already verified. You can sign in directly.' 
            } 
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'VERIFICATION_FAILED',
            message: data.message || 'Verification failed' 
          } 
        },
        { status: 400 }
      );
    }
    
    // Success - return the response from n8n
    const responseData = {
      success: true,
      data: data
    };
    console.log('Final verification response data:', JSON.stringify(responseData, null, 2));
    
    console.log('=== VERIFICATION REQUEST END ===');
    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('=== VERIFICATION ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
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