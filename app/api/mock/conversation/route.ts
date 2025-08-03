import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.conversation_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Conversation ID is required"
          }
        },
        { status: 400 }
      )
    }

    // Mock successful deletion
    const mockResponse = {
      success: true,
      message: "Conversation archived successfully"
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