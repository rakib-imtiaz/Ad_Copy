import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email and password are required",
            details: {
              field: body.email ? "password" : "email",
              issue: "Field is required"
            }
          }
        },
        { status: 400 }
      )
    }

    // Mock successful login
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: "user_123",
          email: body.email,
          name: "John Doe",
          role: "user",
          org_id: "org_456"
        },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8xMjMiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsIm9yZ19pZCI6Im9yZ180NTYiLCJpYXQiOjE3MDU3NzYwMDAsImV4cCI6MTcwNTc3OTYwMH0.mock_signature",
        refresh_token: "refresh_token_here"
      }
    }

    return NextResponse.json(mockResponse)
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