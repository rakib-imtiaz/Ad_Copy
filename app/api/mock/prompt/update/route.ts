import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.agent_id || !body.prompt) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Agent ID and prompt are required"
          }
        },
        { status: 400 }
      )
    }

    // Mock successful prompt update
    const mockResponse = {
      success: true,
      data: {
        agent_id: body.agent_id,
        version: body.version || 2,
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