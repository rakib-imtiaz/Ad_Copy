import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('=== LOGIN REQUEST START ===');
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Validate required fields
    if (!email || !password) {
      console.log('Validation failed: Missing email or password');
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
    console.log('Calling n8n endpoint:', n8nEndpoint);
    
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

    console.log('=== N8N RESPONSE ===');
    console.log('Status:', n8nResponse.status);
    console.log('Status Text:', n8nResponse.statusText);
    console.log('Headers:', Object.fromEntries(n8nResponse.headers.entries()));
    console.log('OK:', n8nResponse.ok);

    // Check for user not found (404 status)
    if (n8nResponse.status === 404) {
      console.log('User not found (404)');
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
      console.log('Authentication failed (401)');
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
    console.log('Login successful, parsing response...');
    
    // Check if response has content before parsing
    const responseText = await n8nResponse.text();
    console.log('N8N Response Text:', responseText);
    
    let data: any = {};
    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
        console.log('N8N Response Data:', JSON.stringify(data, null, 2));
        
        // Check for wrong password response from n8n
        if (data.status === 'wrong password') {
          console.log('Wrong password detected');
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
        
        // Check for user not found response
        if (data['User-Status'] === 'User not found') {
          console.log('User not found detected');
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
        
        // Check for successful login response (n8n returns success: true with user data)
        if (data.success === true && data.data?.user) {
          console.log('Login successful with user data');
          console.log('User data:', data.data.user);
          // Continue with the success flow below
        } else if (data.status === 'password matched') {
          console.log('Password matched, user authenticated successfully');
          console.log('User data:', data.user);
          // Continue with the success flow below
        } else if (data.status === 'wrong password') {
          console.log('Wrong password detected');
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
        } else if (data.status === 'error' || data.success === false) {
          console.log('N8N returned error status:', data.status);
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'AUTHENTICATION_FAILED',
                message: data.message || 'Authentication failed. Please try again.' 
              } 
            },
            { status: 401 }
          );
        } else {
          // If we don't recognize the response format, treat it as an error
          console.log('Unknown response format from n8n:', data);
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'AUTHENTICATION_FAILED',
                message: 'Authentication failed. Please try again.' 
              } 
            },
            { status: 401 }
          );
        }
        
      } catch (parseError) {
        console.error('Failed to parse n8n response:', parseError);
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'INVALID_RESPONSE',
              message: 'Invalid response from authentication service' 
            } 
          },
          { status: 500 }
        );
      }
    }
    
    // Extract cookies from n8n response to forward them
    const setCookieHeader = n8nResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', setCookieHeader);
    
    // Ensure we have valid user data before proceeding
    if (!data.user && !data.data?.user) {
      console.log('No user data found in response');
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'AUTHENTICATION_FAILED',
            message: 'Authentication failed. No user data received.' 
          } 
        },
        { status: 401 }
      );
    }

    // Create the response object
    const responseData = {
      success: true,
      data: {
        user: data.user || data.data?.user, // Use user from n8n response or fallback
        accessToken: data.data?.accessToken,
        token: data.data?.accessToken // Include both for compatibility
      }
    };
    console.log('Final response data:', JSON.stringify(responseData, null, 2));
    
    const response = NextResponse.json(responseData);
    
    // If there's a refresh token cookie, forward it
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
      console.log('Forwarded Set-Cookie header');
    }
    
    console.log('=== LOGIN REQUEST END ===');
    return response;

  } catch (error: any) {
    console.error('=== LOGIN ERROR ===');
    console.error('Error details:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
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
