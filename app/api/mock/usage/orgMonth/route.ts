import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orgId = searchParams.get('org_id')
    const month = searchParams.get('month') || '2024-01'

    if (!orgId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Organization ID is required"
          }
        },
        { status: 400 }
      )
    }

    // Mock usage data
    const mockResponse = {
      success: true,
      data: {
        org_id: orgId,
        month: month,
        metrics: {
          total_conversations: 150,
          total_messages: 1200,
          total_copies_generated: 450,
          kb_items_uploaded: 25,
          media_items_uploaded: 15
        },
        limits: {
          max_conversations_per_month: 1000,
          max_kb_storage_mb: 500,
          max_media_storage_mb: 1000
        },
        usage_percentage: {
          conversations: 15,
          kb_storage: 5,
          media_storage: 1.5
        }
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