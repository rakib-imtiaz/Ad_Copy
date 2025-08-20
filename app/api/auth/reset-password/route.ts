import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate request body
    if (!body.email || !body.newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and new password are required"
          }
        },
        { status: 400 }
      )
    }

    // Validate password strength
    if (body.newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Password must be at least 6 characters long"
          }
        },
        { status: 400 }
      )
    }

    // Call n8n webhook for changing password through forgot password
    const n8nResponse = await fetch(
      'https://n8n.srv934833.hstgr.cloud/webhook/change-password-through-forget-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: body.email,
          newPassword: body.newPassword
        })
      }
    )

    const n8nData = await n8nResponse.json()
    
    if (n8nData.status === "success") {
      return NextResponse.json(
        {
          success: true,
          message: n8nData.message || "Password changed successfully",
          data: {
            email: body.email,
            passwordUpdated: true,
            updatedAt: new Date().toISOString()
          }
        },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PASSWORD_CHANGE_ERROR",
            message: n8nData.message || "Failed to change password"
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
