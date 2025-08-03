import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Mock validation
    if (!body.user_id || !body.youtube_url) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "User ID and YouTube URL are required"
          }
        },
        { status: 400 }
      )
    }

    // Mock successful YouTube ingestion
    const mockResponse = {
      success: true,
      data: {
        kb_item_id: `kb_${Date.now()}`,
        transcript_id: `transcript_${Date.now()}`,
        status: "indexed",
        duration: "8:45",
        segments: 45
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