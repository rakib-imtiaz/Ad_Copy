import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get access token from request headers
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    
    if (!accessToken) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "AUTHENTICATION_ERROR",
            message: "Access token is required"
          }
        },
        { status: 401 }
      )
    }
    
    // Validate request body
    if (!body.old_password || !body.new_password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Old password and new password are required"
          }
        },
        { status: 400 }
      )
    }

    // Validate password strength
    if (body.new_password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "New password must be at least 6 characters long"
          }
        },
        { status: 400 }
      )
    }

    // Call n8n webhook for changing password
    const n8nResponse = await fetch(
      'https://n8n.srv934833.hstgr.cloud/webhook/change-password',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          old_password: body.old_password,
          new_password: body.new_password
        })
      }
    )

    // Check if response is JSON or plain text
    const contentType = n8nResponse.headers.get('content-type')
    let n8nData
    
    if (contentType && contentType.includes('application/json')) {
      n8nData = await n8nResponse.json()
    } else {
      // Handle plain text response
      const textResponse = await n8nResponse.text()
      console.log('n8n text response:', textResponse)
      
      // If it's an error about missing token, return appropriate error
      if (textResponse.includes('No token provided')) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "AUTHENTICATION_ERROR",
              message: "Authentication token is invalid or missing"
            }
          },
          { status: 401 }
        )
      }
      
      // For other text responses, try to parse as JSON or return as error
      try {
        n8nData = JSON.parse(textResponse)
      } catch (parseError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "N8N_ERROR",
              message: textResponse || "Unexpected response from server"
            }
          },
          { status: 400 }
        )
      }
    }
    
    if (n8nData.status === "successful") {
      return NextResponse.json(
        {
          success: true,
          message: n8nData.message || "Password changed successfully",
          data: {
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
    console.error('Change password error:', error)
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
