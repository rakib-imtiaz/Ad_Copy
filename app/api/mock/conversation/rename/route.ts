import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.conversation_id || !body.title) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Conversation ID and title are required"
          }
        },
        { status: 400 }
      )
    }

    // Mock successful rename
    const mockResponse = {
      success: true,
      data: {
        conversation_id: body.conversation_id,
        title: body.title,
        updated_at: new Date().toISOString()
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