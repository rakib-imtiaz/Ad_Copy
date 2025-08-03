import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.user_id || !body.file_path) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "User ID and file path are required"
          }
        },
        { status: 400 }
      )
    }

    // Mock successful KB ingestion
    const mockResponse = {
      success: true,
      data: {
        kb_item_id: `kb_${Date.now()}`,
        status: "processing",
        chunks_created: Math.floor(Math.random() * 20) + 10,
        estimated_completion: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes from now
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