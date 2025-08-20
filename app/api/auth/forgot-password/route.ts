import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.email) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email is required"
          }
        },
        { status: 400 }
      )
    }

    // Call n8n webhook for forgot password
    const n8nResponse = await fetch(
      `https://n8n.srv934833.hstgr.cloud/webhook/forgot-password?email=${encodeURIComponent(body.email)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )

    const n8nData = await n8nResponse.json()
    
    if (n8nData.status === "success") {
      return NextResponse.json(
        {
          success: true,
          message: n8nData.message || "Verification code has been sent. Check your email."
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "N8N_ERROR",
            message: n8nData.message || "Failed to send verification code"
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
