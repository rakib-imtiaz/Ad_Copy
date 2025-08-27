import { NextRequest, NextResponse } from "next/server";

/**
 * API endpoint to validate tokens
 * This provides server-side validation to complement the client-side checks
 */
export async function POST(request: NextRequest) {
  try {
    // Get the token from the Authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'MISSING_TOKEN',
            message: 'No token provided in Authorization header' 
          } 
        },
        { status: 401 }
      );
    }
    
    // Extract the token
    const token = authHeader.substring(7);
    
    // Basic validation - check that it's a properly formatted JWT
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'INVALID_TOKEN_FORMAT',
            message: 'Token is not a valid JWT format' 
          } 
        },
        { status: 401 }
      );
    }
    
    try {
      // Decode payload (without verification, just to check structure)
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Required fields validation
      if (!payload.email || !payload.role) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'INVALID_TOKEN_CLAIMS',
              message: 'Token missing required claims' 
            } 
          },
          { status: 401 }
        );
      }
      
      // Check expiration
      if (payload.exp) {
        const currentTime = Date.now() / 1000;
        if (payload.exp <= currentTime) {
          return NextResponse.json(
            { 
              success: false, 
              error: { 
                code: 'TOKEN_EXPIRED',
                message: 'Token has expired' 
              } 
            },
            { status: 401 }
          );
        }
      }
      
      // Forward the token validation request to n8n webhook (for actual signature verification)
      // This n8n endpoint should verify that the token was signed with the correct secret
      const n8nEndpoint = 'https://n8n.srv934833.hstgr.cloud/webhook/validate-token';
      
      const n8nResponse = await fetch(n8nEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token })
      });
      
      if (!n8nResponse.ok) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              code: 'TOKEN_VALIDATION_FAILED',
              message: 'Token signature validation failed' 
            } 
          },
          { status: 401 }
        );
      }
      
      // Token is valid!
      return NextResponse.json({
        success: true,
        message: 'Token is valid',
        user: {
          email: payload.email,
          role: payload.role
        }
      });
      
    } catch (decodeError) {
      console.error('Error decoding token:', decodeError);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            code: 'TOKEN_DECODE_ERROR',
            message: 'Could not decode token' 
          } 
        },
        { status: 401 }
      );
    }
    
  } catch (error: any) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'SERVER_ERROR',
          message: 'Failed to validate token' 
        } 
      },
      { status: 500 }
    );
  }
}

