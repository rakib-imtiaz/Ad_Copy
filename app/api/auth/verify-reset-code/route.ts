import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.email || !body.verificationCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and verification code are required"
          }
        },
        { status: 400 }
      )
    }

    // Call n8n webhook for password verification code validation
    const n8nResponse = await fetch(
      'https://n8n.srv934833.hstgr.cloud/webhook/for-password-verification-code-validate',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          verificationCode: body.verificationCode
        })
      }
    )

    const n8nData = await n8nResponse.json()
    
    if (n8nData.status === "success") {
      return NextResponse.json(
        {
          success: true,
          message: n8nData.message || "Verification code is valid",
          data: {
            email: body.email,
            codeVerified: true,
            resetToken: "reset_token_" + Date.now() // In production, this would be a secure token
          }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CODE",
            message: n8nData.message || "Invalid verification code"
          }
        },
        { status: 400 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred"
        }
      },
      { status: 500 }
    )
  }
}
