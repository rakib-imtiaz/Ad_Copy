import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.provider || !body.code) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Provider and code are required",
            details: {
              field: body.provider ? "code" : "provider",
              issue: "Field is required"
            }
          }
        },
        { status: 400 }
      )
    }

    // Mock successful OAuth
    const mockResponse = {
      success: true,
      data: {
        user: {
          id: "user_123",
          email: "user@gmail.com",
          name: "John Doe",
          role: "user",
          org_id: "org_456"
        },
        token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8xMjMiLCJlbWFpbCI6InVzZXJAZ21haWwuY29tIiwicm9sZSI6InVzZXIiLCJvcmdfaWQiOiJvcmdfNDU2IiwiaWF0IjoxNzA1Nzc2MDAwLCJleHAiOjE3MDU3Nzk2MDB9.oauth_signature",
        refresh_token: "oauth_refresh_token_here"
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